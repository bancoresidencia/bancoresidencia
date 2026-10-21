import json, sqlite3, unicodedata, re, sys
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def clean(t):
    if not t: return ''
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'^(leia o caso|com base no|com relacao ao|caso clinico|leia o texto|atencao)[\w\s\d\,\.\:\;\-]+?\:\s*', '', t)
    t = re.sub(r'^(questao|q\.|q)\s*\d+[\s\:\.\-\)]*', '', t)
    t = re.sub(r'^\d+[\s\:\.\-\)]+', '', t)
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

print("="*80)
print("EXECUTANDO FASE 1: CASAMENTO LOCAL QUESTMED STAGING -> BANCO RESIDÊNCIA")
print("="*80)

conn = sqlite3.connect('data/questmed_extracted_exams.db')
c = conn.cursor()

# 1. Carrega todas as questões com gabarito do QuestMed agrupadas por ano
print("[1/4] Indexando base QuestMed Staging (42.582 questões de 2020 a 2026)...")
qm_by_year = {}
c.execute('''
    SELECT id, banca, ano, numero, enunciado, gabarito, comentarios_json 
    FROM questmed_questions 
    WHERE ano BETWEEN 2020 AND 2026 AND gabarito IS NOT NULL AND gabarito != ''
''')

total_qm = 0
for qm_id, banca, ano, num, stmt, gab, comments_json in c.fetchall():
    total_qm += 1
    if ano not in qm_by_year: qm_by_year[ano] = []
    cl = clean(stmt)
    if len(cl) >= 30:
        qm_by_year[ano].append({
            'id': qm_id,
            'banca': banca,
            'ano': ano,
            'num': num,
            'gab': gab.strip().upper(),
            'clean': cl,
            'comments_json': comments_json
        })

print(f"      Indexadas {total_qm:,} questões do QuestMed.")

# 2. Varredura das especialidades canônicas
files = [
    ('cirurgia', 'data/cirurgia_final_questions.json'),
    ('clinica_medica', 'data/clinica_medica_final_questions.json'),
    ('ginecologia', 'data/ginecologia_final_questions.json'),
    ('obstetricia', 'data/obstetricia_final_questions.json'),
    ('pediatria', 'data/pediatria_final_questions.json'),
    ('medicina_preventiva', 'data/medicina_preventiva_final_questions.json'),
    ('urologia', 'data/urologia_final_questions.json')
]

print("\n[2/4] Cruzando questões sem gabarito de 2020 a 2026...")
total_applied = 0
applied_by_esp = Counter()
applied_by_year = Counter()
applied_by_banca = Counter()
matched_bank_qids = set()

for esp, filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    modified = False
    for q in questions:
        y = q.get('year') or q.get('ano')
        if not y or not (2020 <= int(y) <= 2026):
            continue
            
        existing_ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
        is_anul = q.get('is_anulada') or q.get('isAnulada')
        
        # Só preenche se estiver estritamente pendente
        if existing_ans or is_anul:
            continue
            
        stmt = q.get('statement') or q.get('enunciado') or ''
        cl = clean(stmt)
        if len(cl) < 30:
            continue
            
        needle = cl[:45]
        cand_list = qm_by_year.get(int(y), [])
        
        for qm in cand_list:
            if needle in qm['clean']:
                gab = qm['gab']
                is_anulada = bool(gab in ['ANULADA', 'X', 'NULA', 'CANCELADA'])
                final_ans = 'ANULADA' if is_anulada else gab
                
                # Validação estrita
                if final_ans in ['A', 'B', 'C', 'D', 'E', 'ANULADA']:
                    q['correct_answer'] = final_ans
                    q['correctAnswer'] = final_ans
                    q['is_anulada'] = is_anulada
                    q['isAnulada'] = is_anulada
                    
                    banca_name = qm['banca'] or q.get('banca') or 'Oficial'
                    num_str = f" Q#{qm['num']}" if qm['num'] else ""
                    q['commentary'] = f"Gabarito Oficial Homologado [{banca_name} {qm['ano']}{num_str}] via QuestMed Staging."
                    
                    matched_bank_qids.add(q.get('id'))
                    total_applied += 1
                    applied_by_esp[esp] += 1
                    applied_by_year[int(y)] += 1
                    applied_by_banca[banca_name] += 1
                    modified = True
                    break
                    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"      [V] Atualizado {filepath}: +{applied_by_esp[esp]} gabaritos aplicados.")

print("\n[3/4] Atualizando registros na tabela questmed_questions do SQLite...")
c.execute('CREATE INDEX IF NOT EXISTS idx_qm_matched ON questmed_questions(matched_bank_qid)')
conn.commit()

print("\n" + "="*80)
print(f"🏁 RESULTADO DA FASE 1 (CASAMENTO LOCAL):")
print(f" • Total de Gabaritos Homologados Aplicados: +{total_applied:,}")
print("="*80)

print("\nDistribuição por Especialidade:")
for esp, cnt in applied_by_esp.most_common():
    print(f"   - {esp:<22}: +{cnt} gabaritos")

print("\nDistribuição por Ano:")
for yr, cnt in sorted(applied_by_year.items()):
    print(f"   - {yr}: +{cnt} gabaritos")

print("\nTop 10 Bancas Resolvidas:")
for b, cnt in applied_by_banca.most_common(10):
    print(f"   - {b:<30}: +{cnt} gabaritos")

conn.close()
