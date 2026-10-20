import json
import csv
import sys
import unicodedata
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def norm(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').upper()
    return re.sub(r'[^A-Z0-9]', '', text)

# 1. Carregar catalogo do QuestMed
with open('data/questmed_all_exams_catalog.json', encoding='utf-8') as f:
    qm_exams = json.load(f)

print(f"Total de exames no QuestMed: {len(qm_exams)}")

qm_2026_bancas = {}
for ex in qm_exams:
    if ex.get('ano') == 2026:
        b = ex.get('banca')
        b_norm = norm(b)
        if b_norm not in qm_2026_bancas:
            qm_2026_bancas[b_norm] = []
        qm_2026_bancas[b_norm].append(ex)

print(f"Total de bancas distintas em 2026 no QuestMed: {len(qm_2026_bancas)}")

# 2. Carregar provas faltantes do nosso banco
missing_2026 = []
with open('data/provas_faltantes_gt20_etapas.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get('ano') == '2026':
            missing_2026.append(row)

print(f"Total de provas faltantes (>=20) de 2026 no nosso banco: {len(missing_2026)}")

# 3. Cruzar
matched_exams = []
for row in missing_2026:
    banca_row = row.get('banca')
    inst_row = row.get('instituicao')
    b_norm = norm(banca_row)
    inst_norm = norm(inst_row)
    
    # Busca exata ou por substring
    match = None
    if b_norm in qm_2026_bancas:
        match = qm_2026_bancas[b_norm]
    else:
        for k in qm_2026_bancas:
            if k == b_norm or (len(k) >= 4 and (k in b_norm or b_norm in k or k in inst_norm or inst_norm in k)):
                match = qm_2026_bancas[k]
                break
    
    if match:
        total_qm_q = sum(m.get('total_questions', 0) for m in match)
        matched_exams.append({
            'instituicao': inst_row,
            'banca': banca_row,
            'faltam': row.get('faltam_gabaritos'),
            'total_no_banco': row.get('total_questoes'),
            'qm_bancas': list(set(m.get('banca') for m in match)),
            'qm_total_questions': total_qm_q,
            'qm_exam_ids': [m.get('id') for m in match]
        })

print(f"\n-> MATCHES ENCONTRADOS PARA 2026: {len(matched_exams)} provas!")
print(f"{'Banca Nosso Banco':<25} | {'Faltam':<8} | {'QuestMed Bancas':<30} | {'QM Qs':<8}")
print("-" * 80)
total_faltam = 0
for m in matched_exams[:30]:
    total_faltam += int(m['faltam'])
    print(f"{m['banca'][:25]:<25} | {m['faltam']:<8} | {str(m['qm_bancas'])[:30]:<30} | {m['qm_total_questions']:<8}")

print(f"\nTotal de questões faltantes nas 30 primeiras provas: {total_faltam:,}")
