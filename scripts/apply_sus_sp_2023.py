import json
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Gabarito Oficial Definitivo SUS-SP 2023 (Acesso Direto, aplicado pelo Instituto Quadrix)
# 'X' = ANULADA
raw_keys = (
    "A B E A X E A D X C A B C E X B D C D C B E D X E "
    "D A B E B A C X X B C D C E C A D C C E X B D E B "
    "C C B C A D C B E A D E C A B D C C D C C A D E D "
    "B A A E E A D C B C C A B E D B C A D X D E X C E"
).split()

gabarito_sus_sp_2023 = {}
for idx, key in enumerate(raw_keys, start=1):
    gabarito_sus_sp_2023[idx] = 'ANULADA' if key == 'X' else key

print(f"Total keys loaded: {len(gabarito_sus_sp_2023)}")
assert len(gabarito_sus_sp_2023) == 100

with open('data/official_exams/SUS_SP/sus_sp_2023_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

match_dict = {}
for m in matches:
    qid = m['id']
    qn = m['q_num']
    ans = gabarito_sus_sp_2023.get(qn)
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
                'source': 'SUS_SP_2023_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Seleção Pública para Residência Médica SUS/SP 2023 (Acesso Direto)',
                'exam_date': 'Janeiro/2023',
                'prova_source': '100-121_PROGRAMAS DE ACESSO DIRETO_prova_objetiva_SES-SP_RM_2023_QUADRIX.pdf',
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

print(f"\nTOTAL HOMOLOGADO SUS-SP 2023: {total_updated} questões!")
