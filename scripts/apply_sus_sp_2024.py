import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo SUS-SP 2024 (Acesso Direto, aplicado 16/12/2023 pelo Instituto Quadrix)
# 'X' = ANULADA
raw_keys = (
    "B A E B A C A B C B B X A A C E C C C B B D E X A "
    "C C X C D B A E C E B D A B D B C E D E B B A B E "
    "E C B X D E A E A C B D C D A A C C E D A A D B C "
    "E D B A A X E B E E D D C A B C A C E D B A D B C"
).split()

gabarito_sus_sp_2024 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sus_sp_2024[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sus_sp_2024)}")
assert len(gabarito_sus_sp_2024) == 100

with open('data/official_exams/SUS_SP/sus_sp_2024_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sus_sp_2024.get(qn)
    match_dict[qid] = (qn, ans)

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
]

total_updated = 0
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    file_updated = 0
    for q in data:
        qid = q.get('id')
        if qid in match_dict:
            qn, ans = match_dict[qid]
            is_anulada = (ans == 'ANULADA')
            if is_anulada:
                q['is_anulada'] = True
                q['isAnulada'] = True
                q['correct_answer'] = None
                q['correctAnswer'] = None
            else:
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
            
            q['official_audit'] = {
                'verified': True,
                'source': 'SUS_SP_2024_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Seleção Pública para Residência Médica SUS/SP 2024 (Acesso Direto)',
                'exam_date': '16/12/2023',
                'prova_source': 'SUS_SP_2024_PV_AD.pdf',
                'question_number': qn,
                'official_gabarito': ans,
                'verified_at': datetime.now().isoformat()
            }
            file_updated += 1
            total_updated += 1
    
    if file_updated > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Atualizado {fpath}: {file_updated} questões homologadas")

print(f"\nTOTAL HOMOLOGADO SUS-SP 2024: {total_updated} questões!")
