import json
import sqlite3
import unicodedata
import re
import os
import hashlib
import uuid
from collections import Counter

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def is_valid_gabarito(gab):
    if not gab:
        return False
    g = str(gab).strip().upper()
    return g in ['A', 'B', 'C', 'D', 'E', 'ANULADA'] or 'ANUL' in g

def run_deduplication_and_staging():
    shield_path = 'data/staging/banco_ativo_hashes_shield.json'
    if not os.path.exists(shield_path):
        print(f"Erro: Shield ativo nao encontrado em {shield_path}. Execute a Fase 1.0 primeiro.")
        return

    print("Carregando Shield de Hashes da Base Ativa...")
    with open(shield_path, 'r', encoding='utf-8') as fp:
        shield = json.load(fp)

    active_by_300 = shield.get('by_stmt_300', {})
    active_by_100 = shield.get('by_stmt_100', {})
    active_by_code = shield.get('by_code', {})
    print(f"Shield carregado: {len(active_by_300):,} hashes de 300 caracteres | {len(active_by_code):,} codigos.")

    seen_expansion_300 = set()
    seen_expansion_100 = set()

    out_ineditas_path = 'data/staging/expansao_ineditas_consolidadas.jsonl'
    out_repetidas_path = 'data/staging/dossie_repetidas_descartadas.jsonl'
    
    # Abrir arquivos de saida em streaming
    fp_ineditas = open(out_ineditas_path, 'w', encoding='utf-8')
    fp_repetidas = open(out_repetidas_path, 'w', encoding='utf-8')

    stats = {
        'total_avaliadas': 0,
        'repetidas_banco_ativo': 0,
        'repetidas_inter_acervos': 0,
        'invalidas_sem_enunciado': 0,
        'invalidas_sem_gabarito': 0,
        'ineditas_puras_aceitas': 0,
        'por_fonte': Counter()
    }

    def process_candidate(candidate, source_name):
        stats['total_avaliadas'] += 1
        
        stmt = candidate.get('statement') or candidate.get('enunciado') or ''
        norm_s = norm_text(stmt)
        if len(norm_s) < 20:
            stats['invalidas_sem_enunciado'] += 1
            return

        gab = candidate.get('correct_answer') or candidate.get('correctAnswer') or candidate.get('gabarito') or candidate.get('correct_letter')
        if not is_valid_gabarito(gab):
            stats['invalidas_sem_gabarito'] += 1
            return
        
        # Limpar gabarito
        clean_gab = str(gab).strip().upper()
        if 'ANUL' in clean_gab:
            clean_gab = 'ANULADA'
            is_anulada = True
        else:
            is_anulada = bool(candidate.get('is_anulada') or candidate.get('isAnulada'))

        code = candidate.get('code')
        if code and str(code).strip().upper() in active_by_code:
            stats['repetidas_banco_ativo'] += 1
            fp_repetidas.write(json.dumps({
                'motivo': 'COLISAO_CODIGO_BANCO_ATIVO',
                'source': source_name,
                'candidate_code': code,
                'matched_active_id': active_by_code[str(code).strip().upper()]
            }) + '\n')
            return

        h300 = norm_s[:300]
        h100 = norm_s[:100]

        # 1. Checar contra o Banco Ativo
        if h300 in active_by_300:
            stats['repetidas_banco_ativo'] += 1
            fp_repetidas.write(json.dumps({
                'motivo': 'COLISAO_ENUNCIADO_300_BANCO_ATIVO',
                'source': source_name,
                'matched_active': active_by_300[h300]
            }) + '\n')
            return
        
        # 2. Checar contra repetidas ja aceitas nos outros acervos de expansao
        if h300 in seen_expansion_300:
            stats['repetidas_inter_acervos'] += 1
            fp_repetidas.write(json.dumps({
                'motivo': 'COLISAO_INTER_ACERVOS_EXPANSAO',
                'source': source_name,
                'h300_snippet': h300[:80]
            }) + '\n')
            return

        # Passou em todas as camadas de blindagem: INÉDITA PURA!
        seen_expansion_300.add(h300)
        seen_expansion_100.add(h100)
        stats['ineditas_puras_aceitas'] += 1
        stats['por_fonte'][source_name] += 1

        # Gerar registro com os metadados e instituicao 100% INTACTOS
        staged_record = {
            'id': str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{source_name}:{h300}")),
            'code': candidate.get('code') or f"EXP-{source_name.upper()}-{stats['ineditas_puras_aceitas']}",
            'institution': candidate.get('institution') or candidate.get('banca') or candidate.get('instituicao_banco') or candidate.get('instituicao_raw') or 'N/A',
            'banca': candidate.get('banca') or candidate.get('institution') or 'N/A',
            'year': candidate.get('year') or candidate.get('ano') or 2024,
            'tipo_prova': candidate.get('tipo_prova') or candidate.get('tipoProva') or 'Residência Médica',
            'modalidade': candidate.get('modalidade') or candidate.get('tipo_prova') or 'Residência Médica',
            'especialidade': candidate.get('especialidade') or candidate.get('specialty') or candidate.get('area') or 'Clínica Geral',
            'tema': candidate.get('tema') or candidate.get('theme') or candidate.get('sub_area') or 'Geral',
            'foco': candidate.get('foco') or candidate.get('focus') or 'Geral',
            'subfoco': candidate.get('subfoco') or 'Geral',
            'statement': stmt,
            'options': candidate.get('options') or candidate.get('alternatives') or candidate.get('opcoes_json') or [],
            'correct_answer': clean_gab,
            'commentary': candidate.get('commentary') or candidate.get('finalCommentary') or candidate.get('comentarios_json') or '',
            'is_anulada': is_anulada,
            'provenance': source_name
        }

        fp_ineditas.write(json.dumps(staged_record) + '\n')

    # ==============================================================
    # 1. PROCESSAR QUESTMED (45.464 q)
    # ==============================================================
    print("\n[1/5] Processando QuestMed (questmed_extracted_exams.db)...")
    qm_db = 'data/questmed_extracted_exams.db'
    if os.path.exists(qm_db):
        conn = sqlite3.connect(qm_db)
        c = conn.cursor()
        c.execute("SELECT id, banca, ano, area, sub_area, tipo_prova, numero, enunciado, opcoes_json, gabarito, comentarios_json FROM questmed_questions")
        cols = ['id', 'banca', 'ano', 'area', 'sub_area', 'tipo_prova', 'numero', 'enunciado', 'opcoes_json', 'gabarito', 'comentarios_json']
        for row in c.fetchall():
            d = dict(zip(cols, row))
            try:
                opts = json.loads(d['opcoes_json']) if isinstance(d['opcoes_json'], str) else d['opcoes_json']
            except:
                opts = d['opcoes_json']
            cand = {
                'code': f"QM-{d['banca']}-{d['ano']}-{d['numero']}",
                'institution': d['banca'],
                'banca': d['banca'],
                'year': d['ano'],
                'area': d['area'],
                'sub_area': d['sub_area'],
                'tipo_prova': d['tipo_prova'],
                'enunciado': d['enunciado'],
                'opcoes_json': opts,
                'gabarito': d['gabarito'],
                'comentarios_json': d['comentarios_json']
            }
            process_candidate(cand, 'questmed')
        conn.close()
        print(f"  QuestMed processado. Inéditas acumuladas: {stats['ineditas_puras_aceitas']:,}")

    # ==============================================================
    # 2. PROCESSAR HARDWORK (provas/ 183k q)
    # ==============================================================
    print("\n[2/5] Processando Hardwork (data/hardwork/provas/)...")
    hw_dir = 'data/hardwork/provas'
    if os.path.exists(hw_dir):
        files_hw = os.listdir(hw_dir)
        for idx, f in enumerate(files_hw):
            p = os.path.join(hw_dir, f)
            try:
                with open(p, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    qs = data if isinstance(data, list) else data.get('questoes', [])
                    for q in qs:
                        process_candidate(q, 'hardwork')
            except:
                pass
            if (idx + 1) % 500 == 0:
                print(f"  {idx + 1}/{len(files_hw)} provas do Hardwork processadas... Inéditas: {stats['ineditas_puras_aceitas']:,}")
        print(f"  Hardwork concluído. Inéditas acumuladas: {stats['ineditas_puras_aceitas']:,}")

    # ==============================================================
    # 3. PROCESSAR PROVADERESIDENCIA (47.709 q)
    # ==============================================================
    print("\n[3/5] Processando ProvaDeResidência (provaderesidencia_coleta.db)...")
    pdr_db = 'data/provaderesidencia_coleta.db'
    if os.path.exists(pdr_db):
        conn = sqlite3.connect(pdr_db)
        c = conn.cursor()
        c.execute("SELECT id, prova_id, instituicao_banco, instituicao_raw, ano, modalidade, numero, enunciado, opcoes_json, gabarito_oficial FROM novas_questoes_categorizadas")
        cols = ['id', 'prova_id', 'instituicao_banco', 'instituicao_raw', 'ano', 'modalidade', 'numero', 'enunciado', 'opcoes_json', 'gabarito_oficial']
        for row in c.fetchall():
            d = dict(zip(cols, row))
            try:
                opts = json.loads(d['opcoes_json']) if isinstance(d['opcoes_json'], str) else d['opcoes_json']
            except:
                opts = d['opcoes_json']
            cand = {
                'code': f"PDR-{d['ano']}-{d['id']}",
                'institution': d['instituicao_banco'] or d['instituicao_raw'],
                'banca': d['instituicao_raw'],
                'year': d['ano'],
                'modalidade': d['modalidade'],
                'enunciado': d['enunciado'],
                'opcoes_json': opts,
                'gabarito': d['gabarito_oficial']
            }
            process_candidate(cand, 'provaderesidencia')
        conn.close()
        print(f"  ProvaDeResidência concluído. Inéditas acumuladas: {stats['ineditas_puras_aceitas']:,}")

    # ==============================================================
    # 4. PROCESSAR MEDBRAVE (52.034 q)
    # ==============================================================
    print("\n[4/5] Processando MedBrave (medbrave_questions_clean.json)...")
    mb_file = 'data/medbrave_questions_clean.json'
    if os.path.exists(mb_file):
        with open(mb_file, 'r', encoding='utf-8') as fp:
            mb_data = json.load(fp)
            for q in mb_data:
                process_candidate(q, 'medbrave')
        print(f"  MedBrave concluído. Inéditas acumuladas: {stats['ineditas_puras_aceitas']:,}")

    # ==============================================================
    # 5. PROCESSAR LIVROS E APOSTILAS DO DRIVE (7.822 q)
    # ==============================================================
    print("\n[5/5] Processando Livros do Drive (questoes_ineditas_livros_drive_7822.json)...")
    dr_file = 'data/questoes_ineditas_livros_drive_7822.json'
    if os.path.exists(dr_file):
        with open(dr_file, 'r', encoding='utf-8') as fp:
            dr_data = json.load(fp)
            for q in dr_data:
                cand = {
                    'code': f"DRIVE-{q.get('spec')}-{q.get('header')}",
                    'institution': q.get('book') or 'Apostila Especializada',
                    'banca': q.get('book') or 'Apostila Especializada',
                    'year': 2024,
                    'especialidade': q.get('spec'),
                    'statement': q.get('statement'),
                    'gabarito': q.get('official_answer'),
                    'commentary': q.get('commentary')
                }
                process_candidate(cand, 'drive_livros')
        print(f"  Livros do Drive concluído. Inéditas acumuladas: {stats['ineditas_puras_aceitas']:,}")

    fp_ineditas.close()
    fp_repetidas.close()

    print("\n" + "=" * 60)
    print("RESUMO DA DEDUPLICAÇÃO E STAGING DA FASE 1.1")
    print("=" * 60)
    print(f"Total de questões candidatas avaliadas: {stats['total_avaliadas']:,}")
    print(f"  - Repetidas com a Base Ativa (132k): {stats['repetidas_banco_ativo']:,}")
    print(f"  - Repetidas entre os Acervos de Expansão: {stats['repetidas_inter_acervos']:,}")
    print(f"  - Inválidas (sem enunciado/sem gabarito): {stats['invalidas_sem_enunciado'] + stats['invalidas_sem_gabarito']:,}")
    print(f"  =======================================================")
    print(f"  >>> TOTAL DE INÉDITAS PURAS VALIDADAS: {stats['ineditas_puras_aceitas']:,}")
    print(f"  =======================================================")
    print("\nDistribuição de Inéditas por Fonte:")
    for src, c in stats['por_fonte'].most_common():
        print(f"  • {src}: {c:,} questões")

    # Salvar manifesto de estatisticas
    with open('data/staging/manifesto_deduplicacao_fase1.json', 'w', encoding='utf-8') as fp:
        json.dump(stats, fp, indent=2)

if __name__ == '__main__':
    run_deduplication_and_staging()

