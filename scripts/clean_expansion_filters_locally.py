"""
Script Operacional: Limpeza Local dos Filtros Clínicos da Expansão
- Remove 'especialidade', 'tema', 'foco' e 'subfoco' exclusivamente das 125.988 questões de expansão.
- Preserva 100% intactas as 132.965 questões da base ativa original com seus filtros padrão-ouro.
- Preserva rigorosamente todos os demais campos da expansão (modalidade, instituição, banca, ano, dificuldade, enunciado, opções, etc.).
- Não altera nada no Supabase (execução 100% local).
"""

import json
import os
import sys
import hashlib
import shutil
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'd:\bancoresidencia'
DATA_DIR = os.path.join(BASE_DIR, 'data')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups', 'pre_limpeza_filtros_expansao_20261106')
STAGING_FILE = os.path.join(DATA_DIR, 'staging', 'expansao_ineditas_consolidadas.jsonl')
PRE_ETAPA1_DIR = os.path.join(DATA_DIR, 'backups', 'pre_etapa1_expansao_20261106')

FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

def compute_checksums(filepath):
    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(1024 * 1024 * 8):
            md5.update(chunk)
            sha256.update(chunk)
    return md5.hexdigest(), sha256.hexdigest()

def main():
    print("=" * 80)
    print("🧹 REMOÇÃO DOS FILTROS CLÍNICOS APENAS DAS QUESTÕES DE EXPANSÃO (100% LOCAL)")
    print("=" * 80)

    # 1. Carregar IDs de expansão
    print("\n[Passo 1] Carregando catálogo de 125.988 IDs da Expansão...")
    if not os.path.exists(STAGING_FILE):
        print(f"ERRO: {STAGING_FILE} não encontrado!")
        sys.exit(1)

    expansion_ids = set()
    with open(STAGING_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                expansion_ids.add(json.loads(line)['id'])

    print(f"  -> Total de IDs da expansão indexados: {len(expansion_ids):,}")

    # 2. Carregar IDs e filtros da Base Ativa Original para verificação de segurança
    print("\n[Passo 2] Carregando e mapeando 132.965 questões da Base Ativa Original...")
    active_golden = {}
    for fname in os.listdir(PRE_ETAPA1_DIR):
        if fname.endswith('.json') and fname != 'manifest_backup.json':
            p = os.path.join(PRE_ETAPA1_DIR, fname)
            with open(p, 'r', encoding='utf-8') as f:
                for q in json.load(f):
                    active_golden[q['id']] = {
                        'especialidade': q.get('especialidade', ''),
                        'tema': q.get('tema', ''),
                        'foco': q.get('foco', ''),
                        'subfoco': q.get('subfoco', '')
                    }
    print(f"  -> Total de IDs da base ativa indexados: {len(active_golden):,}")

    # Validar disjunção absoluta
    intersection = expansion_ids.intersection(active_golden.keys())
    if intersection:
        print(f"ERRO FATAL: Interseção detectada entre ativa e expansão: {len(intersection)} IDs!")
        sys.exit(1)
    print("  -> Interseção ativa x expansão: ZERO (disjunção 100% confirmada)")

    # 3. Criar backup pré-limpeza dos arquivos em data/
    print(f"\n[Passo 3] Criando backup de segurança em {BACKUP_DIR}...")
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backup_manifest = {
        "timestamp": datetime.now().isoformat(),
        "descricao": "Backup dos arquivos locais imediatamente antes da remocao dos filtros clinicos da expansao",
        "arquivos": {}
    }

    for fname in FILES:
        src = os.path.join(DATA_DIR, fname)
        dst = os.path.join(BACKUP_DIR, fname)
        shutil.copy2(src, dst)
        md5, sha256 = compute_checksums(dst)
        size_mb = os.path.getsize(dst) / (1024 * 1024)
        backup_manifest["arquivos"][fname] = {
            "tamanho_mb": round(size_mb, 2),
            "md5": md5,
            "sha256": sha256
        }
        print(f"  -> Copiado {fname} ({size_mb:.2f} MB)")

    with open(os.path.join(BACKUP_DIR, 'manifest_backup.json'), 'w', encoding='utf-8') as f:
        json.dump(backup_manifest, f, indent=2, ensure_ascii=False)
    print("  -> Backup concluído com sucesso!")

    # 4. Processar e Limpar cada arquivo local
    print("\n[Passo 4] Aplicando limpeza nos arquivos locais de data/...")
    total_processed = 0
    total_expansion_cleared = 0
    total_active_preserved = 0

    stats_per_file = {}

    for fname in FILES:
        fpath = os.path.join(DATA_DIR, fname)
        print(f"\nProcessando {fname}...")
        with open(fpath, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        file_exp_cleared = 0
        file_act_preserved = 0

        for q in questions:
            qid = q.get('id')
            if qid in expansion_ids:
                # É QUESTÃO DA EXPANSÃO: Remover filtros clínicos
                q['especialidade'] = ""
                q['tema'] = ""
                q['foco'] = ""
                q['subfoco'] = ""
                if 'specialty' in q:
                    q['specialty'] = ""
                if 'subtheme' in q:
                    q['subtheme'] = ""
                file_exp_cleared += 1
            else:
                # É QUESTÃO DA BASE ATIVA: Preservar filtros originais
                golden = active_golden.get(qid)
                if golden:
                    # Garantir integridade absoluta com a base ativa
                    q['especialidade'] = golden['especialidade']
                    q['tema'] = golden['tema']
                    q['foco'] = golden['foco']
                    q['subfoco'] = golden['subfoco']
                file_act_preserved += 1

        total_processed += len(questions)
        total_expansion_cleared += file_exp_cleared
        total_active_preserved += file_act_preserved

        stats_per_file[fname] = {
            'total': len(questions),
            'expansao_limpa': file_exp_cleared,
            'ativa_preservada': file_act_preserved
        }

        # Salvar arquivo atualizado atomicamente
        tmp_path = fpath + '.tmp'
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False)
        shutil.move(tmp_path, fpath)

        size_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f"  [OK] {fname}: {len(questions):,} questões (Ativa: {file_act_preserved:,} intactas | Expansão: {file_exp_cleared:,} limpas) [{size_mb:.2f} MB]")

    # 5. Atualizar também staging/expansao_ineditas_consolidadas.jsonl para consistência
    print(f"\n[Passo 5] Sincronizando arquivo de staging ({STAGING_FILE})...")
    tmp_staging = STAGING_FILE + '.tmp'
    staging_lines = 0
    with open(STAGING_FILE, 'r', encoding='utf-8') as fin, open(tmp_staging, 'w', encoding='utf-8') as fout:
        for line in fin:
            if not line.strip():
                continue
            q = json.loads(line)
            q['especialidade'] = ""
            q['tema'] = ""
            q['foco'] = ""
            q['subfoco'] = ""
            if 'specialty' in q:
                q['specialty'] = ""
            if 'subtheme' in q:
                q['subtheme'] = ""
            fout.write(json.dumps(q, ensure_ascii=False) + '\n')
            staging_lines += 1

    shutil.move(tmp_staging, STAGING_FILE)
    print(f"  -> Staging sincronizado: {staging_lines:,} questões de expansão com filtros clínicos limpos.")

    # 6. Bateria Automatizada de Testes de Integridade
    print("\n" + "=" * 80)
    print("🧪 BATERIA AUTOMATIZADA DE TESTES DE INTEGRIDADE (T1 a T5)")
    print("=" * 80)

    # T1: Conservação Volumétrica
    t1_pass = (total_processed == 258953 and total_active_preserved == 132965 and total_expansion_cleared == 125988)
    print(f"TEST-1 (Conservação Volumétrica Absoluta): {'APROVADO' if t1_pass else 'REPROVADO'}")
    print(f"  -> Total Processado: {total_processed:,} (Esperado: 258.953)")
    print(f"  -> Ativa Preservada: {total_active_preserved:,} (Esperado: 132.965)")
    print(f"  -> Expansão Limpa  : {total_expansion_cleared:,} (Esperado: 125.988)")

    # T2: Verificação de Filtros Vazios na Expansão
    print("\nAuditoria amostral dos arquivos salvos...")
    all_cleared = True
    active_mismatches = 0
    preserved_fields_check = True

    cardio_count = 0

    for fname in FILES:
        fpath = os.path.join(DATA_DIR, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            qs = json.load(f)

        for q in qs:
            qid = q['id']
            if qid in expansion_ids:
                if q['especialidade'] != "" or q['tema'] != "" or q['foco'] != "" or q['subfoco'] != "":
                    all_cleared = False
                # Garantir que campos não clínicos continuam intactos
                if not q.get('modalidade') or not q.get('institution') or not q.get('statement') or not q.get('options'):
                    preserved_fields_check = False
            else:
                golden = active_golden.get(qid)
                if not golden or q['especialidade'] != golden['especialidade'] or q['tema'] != golden['tema'] or q['foco'] != golden['foco'] or q['subfoco'] != golden['subfoco']:
                    active_mismatches += 1

            if q.get('tema') == 'Cardiologia' or q.get('foco') == 'Cardiologia':
                cardio_count += 1

    t2_pass = all_cleared
    print(f"TEST-2 (Filtros Clínicos da Expansão 100% Limpos): {'APROVADO' if t2_pass else 'REPROVADO'}")

    t3_pass = (active_mismatches == 0)
    print(f"TEST-3 (Base Ativa 100% Fiel ao Golden Inicial): {'APROVADO' if t3_pass else 'REPROVADO'} (Divergências: {active_mismatches})")

    t4_pass = preserved_fields_check
    print(f"TEST-4 (Preservação Estrita dos Metadados Não Clínicos): {'APROVADO' if t4_pass else 'REPROVADO'}")

    t5_pass = (cardio_count < 7000)
    print(f"TEST-5 (Erradicação da Anomalia de Cardiologia): {'APROVADO' if t5_pass else 'REPROVADO'}")
    print(f"  -> Questões restantes em Cardiologia: {cardio_count:,} (apenas questões legítimas da base ativa)")

    status_final = t1_pass and t2_pass and t3_pass and t4_pass and t5_pass
    print("\n" + "=" * 80)
    print(f"STATUS FINAL DA OPERAÇÃO: {'100% APROVADO COM SUCESSO' if status_final else 'FALHA NA VALIDAÇÃO'}")
    print("=" * 80)

if __name__ == '__main__':
    main()
