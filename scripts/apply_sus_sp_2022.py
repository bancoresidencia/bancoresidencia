import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo SUS-SP 2022 (Acesso Direto, aplicado pelo Instituto Quadrix)
# 'X' = ANULADA
raw_keys = (
    "D C C D B E B D D E A C A A D E B D D C A B A D D "
    "A B C D E E D A C C D E C E C A D A E E C B C E E "
    "B C E D D E A B C A E C D B A A B D C E C A B E D "
    "A C D E B A E E C A B B D E C A B D X B A X D B D"
).split()

gabarito_sus_sp_2022 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sus_sp_2022[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sus_sp_2022)}")
assert len(gabarito_sus_sp_2022) == 100

with open('data/official_exams/SUS_SP/sus_sp_2022_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sus_sp_2022.get(qn)
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
                'source': 'SUS_SP_2022_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Seleção Pública para Residência Médica SUS/SP 2022 (Acesso Direto)',
                'exam_date': 'Janeiro/2022',
                'prova_source': 'QUADRIX_001_SES-SP-RM-2022_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS_.pdf',
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

print(f"\nTOTAL HOMOLOGADO SUS-SP 2022: {total_updated} questões!")
