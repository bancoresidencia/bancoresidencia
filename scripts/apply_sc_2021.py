import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo ISCMSP 2021 (Acesso Direto, aplicado 20/12/2020)
# 'X' = ANULADA
raw_keys = (
    "D D E A A C C C A B B X E B B E B E A D D A E A C "
    "D C A E D E C B X A B B C E A C D E D A A C A C B "
    "D B B X D B E D E A D C E B A C D C E B C D B E A "
    "B A D A E D C B E X E E D D A B X B C B E D A C C"
).split()

gabarito_sc_2021 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sc_2021[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sc_2021)}")
assert len(gabarito_sc_2021) == 100

with open('data/official_exams/SANTA_CASA_SP/sc_2021_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sc_2021.get(qn)
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
                'source': 'SANTA_CASA_2021_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Concurso Residência Médica ISCMSP 2021 (Acesso Direto)',
                'exam_date': '20/12/2020',
                'prova_source': '100_ISCMSP_RM_2021_Programa_Acesso_Direto_QUADRIX',
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

print(f"\nTOTAL HOMOLOGADO SANTA CASA 2021: {total_updated} questões!")
