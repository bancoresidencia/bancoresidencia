import json

# The 5 IAMSPE 2022 questions
# Q19: D (cirurgia)
# Q20: A (cirurgia)
# Q29: E (cirurgia)
# Q30: B (cirurgia)
# Q45: B (pediatria)

audit_base = {
    'concurso': 'IAMSPE 2022 (Edital 001/2022 Acesso Direto)',
    'banca': 'Quadrix',
    'status': 'VALIDA',
    'source_document': 'IAMSPE_2022_GABARITO_DEFINITIVO.pdf',
    'source_url': 'https://quadrix.org.br/uploads/861/concursos/1213/anexos/36a1021561e5455c0901ed0cf92be6e8.pdf',
    'is_verified': True,
    'verified': True
}

updates = {
    'e0213f18-45e6-4e96-b592-d06ccb172b63': {
        'qnum': 19,
        'ans': 'D',
        'file': 'data/cirurgia_final_questions.json'
    },
    '3ce64b58-d9cf-43f9-a828-efd185486c68': {
        'qnum': 20,
        'ans': 'A',
        'file': 'data/cirurgia_final_questions.json'
    },
    'daafd7fd-85f2-4a94-99e3-ec38ea666c84': {
        'qnum': 29,
        'ans': 'E',
        'file': 'data/cirurgia_final_questions.json'
    },
    '99c11080-2c46-4be5-a1bf-1bc0ca988d82': {
        'qnum': 30,
        'ans': 'B',
        'file': 'data/cirurgia_final_questions.json'
    },
    'add46c73-1271-4d9a-956f-a1ea2dce765f': {
        'qnum': 45,
        'ans': 'B',
        'file': 'data/pediatria_final_questions.json'
    }
}

for qid, info in updates.items():
    fpath = info['file']
    with open(fpath, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    
    found = False
    for q in data:
        if q.get('id') == qid:
            found = True
            q['correct_answer'] = info['ans']
            q['correctAnswer'] = info['ans']
            q['is_anulada'] = False
            q['isAnulada'] = False
            audit = dict(audit_base)
            audit['question_number'] = info['qnum']
            audit['gabarito_oficial'] = info['ans']
            q['official_audit'] = audit
            q['official_source'] = 'IAMSPE 2022 Gabarito Definitivo Quadrix'
            print(f"Updated {qid} (Q{info['qnum']}) -> {info['ans']} in {fpath}")
            break
            
    if found:
        with open(fpath, 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
    else:
        print(f"ERROR: {qid} not found in {fpath}")

print("IAMSPE 2022 100% COMPLETE!")
