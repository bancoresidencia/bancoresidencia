import json
import os
import unicodedata
import re
import hashlib
from collections import Counter

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_option_texts(options):
    texts = []
    if isinstance(options, list):
        for opt in options:
            if isinstance(opt, dict):
                t = opt.get('text') or opt.get('texto') or ''
                if t:
                    texts.append(norm_text(t))
            elif isinstance(opt, str):
                texts.append(norm_text(opt))
    elif isinstance(options, dict):
        for k, v in options.items():
            if isinstance(v, str):
                texts.append(norm_text(v))
    texts.sort()
    return '|'.join(texts)

files = [
    'data/clinica_medica_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/medicina_preventiva_final_questions.json'
]

print("=== FASE 1.0: CONSTRUINDO HASHES SHIELD DA BASE ATIVA (132k) ===")
shield = {
    'by_stmt_100': {},   # prefixo 100 chars -> {qid, esp, banca, year}
    'by_stmt_300': {},   # prefixo 300 chars -> {qid, esp, banca, year}
    'by_code': {},       # code -> qid
    'total_indexed': 0
}

total_records = 0

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Erro: arquivo ausente {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    
    count_file = len(data)
    total_records += count_file
    print(f"Indexando {os.path.basename(filepath)} ({count_file:,} questoes)...")

    for q in data:
        qid = q.get('id')
        code = q.get('code')
        stmt = q.get('statement') or q.get('enunciado') or ''
        norm_s = norm_text(stmt)
        
        meta = {
            'id': qid,
            'code': code,
            'institution': q.get('institution') or q.get('banca') or '',
            'year': q.get('year') or q.get('ano') or '',
            'specialty': q.get('especialidade') or os.path.basename(filepath).replace('_final_questions.json', '')
        }

        if len(norm_s) >= 20:
            h100 = norm_s[:100]
            if h100 not in shield['by_stmt_100']:
                shield['by_stmt_100'][h100] = meta
            
            h300 = norm_s[:300]
            if h300 not in shield['by_stmt_300']:
                shield['by_stmt_300'][h300] = meta

        if code:
            norm_c = str(code).strip().upper()
            shield['by_code'][norm_c] = qid

shield['total_indexed'] = total_records

out_path = 'data/staging/banco_ativo_hashes_shield.json'
print(f"Salvando shield em {out_path}...")
with open(out_path, 'w', encoding='utf-8') as fp:
    json.dump(shield, fp)

size_mb = os.path.getsize(out_path) / (1024 * 1024)
print(f"Shield gerado com sucesso ({size_mb:.2f} MB)!")
print(f"Total registros indexados: {total_records:,}")
print(f"Hashes únicos de 100 caracteres: {len(shield['by_stmt_100']):,}")
print(f"Hashes únicos de 300 caracteres: {len(shield['by_stmt_300']):,}")
print(f"Códigos únicos indexados: {len(shield['by_code']):,}")

# BATERIA DE TESTES FASE 1.0
print("\n--- BATERIA DE TESTES DA FASE 1.0 ---")
test_1_0_1 = len(shield['by_stmt_300']) > 120000
test_1_0_2 = total_records == 132965

print(f"TEST-1.0.1 (Unicidade e robustez dos hashes): {'APROVADO' if test_1_0_1 else 'REPROVADO'}")
print(f"TEST-1.0.2 (Cobertura total de 132.965 registros): {'APROVADO' if test_1_0_2 else 'REPROVADO'} ({total_records} / 132.965)")

if not (test_1_0_1 and test_1_0_2):
    print("FALHA NOS TESTES DA FASE 1.0! Abortando.")
    exit(1)
print("Fase 1.0 concluída com 100% de sucesso!")

