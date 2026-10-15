import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo ISCMSP 2023 (Acesso Direto, aplicado 27/11/2022)
# 'X' = ANULADA
raw_keys = (
    "D B D B E A B C D E C E C D D E A A D B A E A A A "
    "E A X A D C C D A B D D A D A C D D B E B C A C A "
    "B A X D E D B C C B B D C A B C B A D B C D X A C "
    "B A D X C B X C C C X D A C D A C B D E B C A X D"
).split()

gabarito_sc_2023 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sc_2023[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sc_2023)}")
assert len(gabarito_sc_2023) == 100

with open('data/official_exams/SANTA_CASA_SP/sc_2023_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sc_2023.get(qn)
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
                'source': 'SANTA_CASA_2023_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Concurso Residência Médica ISCMSP 2023 (Acesso Direto)',
                'exam_date': '27/11/2022',
                'prova_source': 'QUADRIX_Cad_Prova_100-120_Prog_Acesso_Direto_ISCMSP_RM_2023.pdf',
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

print(f"\nTOTAL HOMOLOGADO SANTA CASA 2023: {total_updated} questões!")
