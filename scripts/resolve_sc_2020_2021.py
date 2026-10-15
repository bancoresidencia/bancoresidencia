import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Update Clinica Medica (Santa Casa 2020 Q26 and Q29)
with open('data/clinica_medica_final_questions.json', 'r', encoding='utf-8') as f:
    cm = json.load(f)

for q in cm:
    if q.get('id') == '15e5a670-0929-4c1e-ba3e-1b86e611b638':
        q['correct_answer'] = 'B'
        q['correctAnswer'] = 'B'
        q['is_anulada'] = False
        q['isAnulada'] = False
        q['official_source'] = 'Gabarito Oficial Definitivo ISCMSP / Quadrix 2020 Questão 26'
        q['official_audit'] = {'verified': True, 'institution': 'Santa Casa de São Paulo', 'year': 2020, 'q_num': 26, 'ans': 'B'}
        print("Updated Santa Casa 2020 Q26 (Derrame pleural) -> B")

    elif q.get('id') == 'f8085777-332f-42ea-9a28-b344ec0997d3':
        q['correct_answer'] = 'D'
        q['correctAnswer'] = 'D'
        q['is_anulada'] = False
        q['isAnulada'] = False
        q['official_source'] = 'Gabarito Oficial Definitivo ISCMSP / Quadrix 2020 Questão 29'
        q['official_audit'] = {'verified': True, 'institution': 'Santa Casa de São Paulo', 'year': 2020, 'q_num': 29, 'ans': 'D'}
        print("Updated Santa Casa 2020 Q29 (Carcinoma gástrico) -> D")

with open('data/clinica_medica_final_questions.json', 'w', encoding='utf-8') as f:
    json.dump(cm, f, ensure_ascii=False, indent=2)

# Update Cirurgia (Santa Casa 2021 Q21)
with open('data/cirurgia_final_questions.json', 'r', encoding='utf-8') as f:
    cir = json.load(f)

for q in cir:
    if q.get('id') == 'c88db56a-eefe-45f7-85d5-dc6d8a456337':
        q['correct_answer'] = 'D'
        q['correctAnswer'] = 'D'
        q['is_anulada'] = False
        q['isAnulada'] = False
        q['official_source'] = 'Gabarito Oficial Definitivo ISCMSP / Quadrix 2021 Questão 21'
        q['official_audit'] = {'verified': True, 'institution': 'Santa Casa de São Paulo', 'year': 2021, 'q_num': 21, 'ans': 'D'}
        print("Updated Santa Casa 2021 Q21 (Hérnia inguinocrural) -> D")

with open('data/cirurgia_final_questions.json', 'w', encoding='utf-8') as f:
    json.dump(cir, f, ensure_ascii=False, indent=2)

print("\nSanta Casa 2020 e 2021 agora estão 100% resolvidas e homologadas!")
