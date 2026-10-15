import json
import glob
from datetime import datetime

# Official Gabarito for Santa Casa SP 2020 (Acesso Direto, applied 23/11/2019)
gabarito_sc_2020 = {
    1: 'E', 2: 'B', 3: 'D', 4: 'E', 5: 'C', 6: 'D', 7: 'C', 8: 'A', 9: 'A', 10: 'B',
    11: 'D', 12: 'B', 13: 'E', 14: 'C', 15: 'A', 16: 'A', 17: 'D', 18: 'E', 19: 'B', 20: 'C',
    21: 'A', 22: 'C', 23: 'D', 24: 'E', 25: 'A', 26: 'B', 27: 'C', 28: 'E', 29: 'D', 30: 'B',
    31: 'A', 32: 'C', 33: 'D', 34: 'E', 35: 'B', 36: 'A', 37: 'C', 38: 'B', 39: 'D', 40: 'E',
    41: 'C', 42: 'D', 43: 'B', 44: 'E', 45: 'E', 46: 'A', 47: 'C', 48: 'B', 49: 'D', 50: 'D',
    51: 'A', 52: 'A', 53: 'B', 54: 'C', 55: 'E', 56: 'B', 57: 'D', 58: 'C', 59: 'E', 60: 'A',
    61: 'B', 62: 'D', 63: 'C', 64: 'C', 65: 'A', 66: 'E', 67: 'E', 68: 'C', 69: 'D', 70: 'A',
    71: 'D', 72: 'B', 73: 'C', 74: 'A', 75: 'E', 76: 'B', 77: 'E', 78: 'B', 79: 'A', 80: 'D',
    81: 'C', 82: 'A', 83: 'E', 84: 'A', 85: 'C', 86: 'D', 87: 'A', 88: 'D', 89: 'C', 90: 'B',
    91: 'A', 92: 'D', 93: 'E', 94: 'B', 95: 'C', 96: 'B', 97: 'A', 98: 'C', 99: 'B', 100: 'E'
}

# Load matches and patch specific disambiguations
with open('data/official_exams/SANTA_CASA_SP/sc_2020_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

# Explicit map for vignettes
vignette_map = {
    'd91f4c09-8f54-4e3f-9ddc-c60e8fc8e7ec': 15,
    '11955789-6270-43c4-95bf-aa36478a8ffd': 16,
    'b76136a5-fd8b-4ba4-b54b-9d01de69eb1e': 17,
    'c7ab4922-51bb-46ab-9b8d-a70b5ef97678': 48,
    '99dae9e0-0ab6-45e6-b46d-570c63dd862e': 49,
    '59b8c8a9-5708-497e-bfa6-5205e4187f6b': 50,
    '1ae26aad-e266-422a-8296-684af7c295e8': 94,
    '4332659d-6466-4ddd-a9c9-fc4f9fb21686': 95,
    'b2ab7de7-9d7d-4b7d-aac4-845c2655ab23': 96,
    'f8085777-332f-42ea-9a28-b344ec0997d3': 29
}

match_dict = {}
for m in matches:
    qid = m['id']
    if qid in vignette_map:
        qn = vignette_map[qid]
    else:
        qn = m['q_num']
    ans = gabarito_sc_2020.get(qn)
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
                'source': 'SANTA_CASA_2020_GABARITO_DEFINITIVO.pdf',
                'banca': 'Instituto Quadrix',
                'edital': 'Concurso Residência Médica ISCMSP 2020 (Acesso Direto)',
                'exam_date': '23/11/2019',
                'prova_source': '100_ISCMSP_RM_2020_Programa_Acesso_Direto_QUADRIX_Cad. Prova.pdf',
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

print(f"\nTOTAL HOMOLOGADO SANTA CASA 2020: {total_updated} questões!")
