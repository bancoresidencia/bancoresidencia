import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo ISCMSP 2022 (Acesso Direto, aplicado 04/12/2021)
# 'X' = ANULADA
raw_keys = (
    "C A D D D D D A E B A X X C C C A X A A A D D B E "
    "B E E B B D B D B A C D A D C E C X D D C E D B B "
    "E C C D A B B C A X A B B D D A A B C B A A C C B "
    "D A E C B D X C C D C E B B B E A D E A B A B D C"
).split()

gabarito_sc_2022 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sc_2022[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sc_2022)}")
assert len(gabarito_sc_2022) == 100

with open('data/official_exams/SANTA_CASA_SP/sc_2022_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sc_2022.get(qn)
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
                'source': 'SANTA_CASA_2022_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Concurso Residência Médica ISCMSP 2022 (Acesso Direto)',
                'exam_date': '04/12/2021',
                'prova_source': 'QUADRIX_Cad_Prova_Prog_Acesso_Direto_ISCMSP_RM_2022.pdf',
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

print(f"\nTOTAL HOMOLOGADO SANTA CASA 2022: {total_updated} questões!")
