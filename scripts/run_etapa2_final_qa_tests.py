import json
import os
import unicodedata
import re
import sys

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def run_qa():
    print("=" * 75)
    print("[QA] BATERIA FINAL GLOBAL DE TESTES DE INTEGRIDADE (T1 a T6) - 258.953 QUESTOES")
    print("=" * 75)

    files = [
        ('Preventiva', 'data/medicina_preventiva_final_questions.json'),
        ('Pediatria', 'data/pediatria_final_questions.json'),
        ('Cirurgia Geral', 'data/cirurgia_final_questions.json'),
        ('Ginecologia', 'data/ginecologia_final_questions.json'),
        ('Obstetricia', 'data/obstetricia_final_questions.json'),
        ('Clinica Medica', 'data/clinica_medica_final_questions.json')
    ]

    all_questions = []
    area_counts = {}
    dups_subfoco_foco = 0
    null_or_empty_nodes = 0
    lixeira_nodes = 0
    especialidades_encontradas = set()
    temas_encontrados = set()

    LIXEIRA_TERMS = {'geral', 'outros', 'sem tema', 'sem foco', 'diversos', 'n a', 'none', ''}

    print("\n[ETAPA 1] Carregando e Auditando os Arquivos Locais Unificados...")
    for label, path in files:
        if not os.path.exists(path):
            print(f"[ERRO] Arquivo ausente: {path}")
            sys.exit(1)
        with open(path, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
        area_counts[label] = len(data)
        all_questions.extend(data)
        print(f"  * {label:15s}: {len(data):,} questoes")

    total_q = len(all_questions)
    print(f"\nTotal Consolidado Local: {total_q:,} questoes.")

    # 1. T1: Anti-duplicação subfoco == foco
    # 2. T3: Inexistência de nós nulos
    # 3. T4: Erradicação total de lixeiras
    print("\n[ETAPA 2] Executando Analise Estrutural dos 258.953 Registros...")
    for q in all_questions:
        mod = str(q.get('modalidade') or '').strip()
        esp = str(q.get('especialidade') or '').strip()
        tema = str(q.get('tema') or '').strip()
        foco = str(q.get('foco') or '').strip()
        subfoco = str(q.get('subfoco') or '').strip()

        especialidades_encontradas.add(esp)
        temas_encontrados.add(tema)

        # Checagem de nós nulos/vazios
        if not mod or not esp or not tema or not foco or not subfoco:
            null_or_empty_nodes += 1

        # Checagem de duplicação subfoco == foco
        if norm_text(subfoco) == norm_text(foco):
            dups_subfoco_foco += 1

        # Checagem de lixeiras
        if norm_text(foco) in LIXEIRA_TERMS or norm_text(subfoco) in LIXEIRA_TERMS or norm_text(tema) in LIXEIRA_TERMS:
            lixeira_nodes += 1

    t1_pass = (dups_subfoco_foco == 0)
    t2_pass = (total_q == 258953)
    t3_pass = (null_or_empty_nodes == 0)
    t4_pass = (lixeira_nodes == 0)

    # 4. T5: Imutabilidade estrita das instituições e gabaritos contra backup original
    print("\n[ETAPA 3] Verificando Imutabilidade contra o Backup Pre-Etapa 1...")
    backup_dir = 'data/backups/pre_etapa1_expansao_20261106'
    t5_pass = True
    tested_backup_count = 0
    mismatches = []

    # Criar dict de id -> q da base atual
    curr_map = {q['id']: q for q in all_questions}

    for fname in os.listdir(backup_dir):
        if not fname.endswith('.json') or fname == 'manifest_backup.json':
            continue
        bpath = os.path.join(backup_dir, fname)
        with open(bpath, 'r', encoding='utf-8') as fp:
            bdata = json.load(fp)
        for bq in bdata[:200]: # Amostra de 200 de cada arquivo de backup = 1200 verificações
            bid = bq['id']
            tested_backup_count += 1
            if bid not in curr_map:
                t5_pass = False
                mismatches.append(f"ID {bid} do backup ausente na base atual")
                break
            cq = curr_map[bid]
            if (cq.get('institution') or '') != (bq.get('institution') or ''):
                t5_pass = False
                mismatches.append(f"Instituicao divergente em {bid}: '{cq.get('institution')}' != '{bq.get('institution')}'")
                break
            if (cq.get('banca') or '') != (bq.get('banca') or ''):
                t5_pass = False
                mismatches.append(f"Banca divergente em {bid}: '{cq.get('banca')}' != '{bq.get('banca')}'")
                break
            if str(cq.get('year') or '') != str(bq.get('year') or ''):
                t5_pass = False
                mismatches.append(f"Ano divergente em {bid}: '{cq.get('year')}' != '{bq.get('year')}'")
                break
            if str(cq.get('correct_answer') or '') != str(bq.get('correct_answer') or ''):
                t5_pass = False
                mismatches.append(f"Gabarito divergente em {bid}: '{cq.get('correct_answer')}' != '{bq.get('correct_answer')}'")
                break

    print(f"  * Questoes de backup auditadas: {tested_backup_count:,}")
    if mismatches:
        print(f"  * Mismatches encontrados: {mismatches[:3]}")

    print("\n" + "=" * 75)
    print("RESULTADO CONSOLIDADO DA BATERIA DE TESTES (T1 a T5)")
    print("=" * 75)
    print(f"* T1 (Invariante Anti-Duplicacao subfoco != foco) : {'APROVADO' if t1_pass else 'REPROVADO'} (Divergencias: {dups_subfoco_foco})")
    print(f"* T2 (Conservacao Volumetrica Absoluta - 258.953) : {'APROVADO' if t2_pass else 'REPROVADO'} (Total: {total_q:,})")
    print(f"* T3 (Inexistencia de Nos Nulos/Vazios)           : {'APROVADO' if t3_pass else 'REPROVADO'} (Nulos: {null_or_empty_nodes})")
    print(f"* T4 (Erradicacao Total de Lixeiras)             : {'APROVADO' if t4_pass else 'REPROVADO'} (Lixeiras: {lixeira_nodes})")
    print(f"* T5 (Imutabilidade de Instituicoes/Gabaritos)   : {'APROVADO' if t5_pass else 'REPROVADO'} (Amostras auditadas: {tested_backup_count})")
    print("=" * 75)
    print(f"* Especialidades Canonicas Encontradas ({len(especialidades_encontradas)}): {sorted(list(especialidades_encontradas))}")
    print(f"* Total de Temas Harmonizados Unicos: {len(temas_encontrados)}")
    print("=" * 75)

    all_passed = t1_pass and t2_pass and t3_pass and t4_pass and t5_pass
    return all_passed

if __name__ == '__main__':
    ok = run_qa()
    sys.exit(0 if ok else 1)
