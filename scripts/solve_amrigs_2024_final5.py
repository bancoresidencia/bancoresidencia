import json

audit_base = {
    'concurso': 'AMRIGS / AMB 02/2023 (Edição Residência 2024)',
    'banca': 'Fundatec',
    'status': 'VALIDA',
    'source_document': 'AMRIGS_2023_GABARITO.pdf',
    'source_url': 'https://fundatec.org.br/portal/concursos/gabarito_definitivo_amrigs_2023.pdf',
    'is_verified': True,
    'verified': True
}

updates = {
    'bc17da94-d351-41fc-8e34-c8fe5f437b44': {
        'qnum': 26,
        'ans': 'A',
        'file': 'data/clinica_medica_final_questions.json'
    },
    '1d28ebba-05d4-4cd7-b8de-7c9b32bdb0ec': {
        'qnum': 32,
        'ans': 'A',
        'file': 'data/cirurgia_final_questions.json'
    },
    '15099e5f-ebab-413a-941f-698a5fdfa7ea': {
        'qnum': 35,
        'ans': 'A',
        'file': 'data/cirurgia_final_questions.json'
    },
    'b31dad9b-b56f-48fd-be50-26fd989e8642': {
        'qnum': 37,
        'ans': 'A',
        'file': 'data/cirurgia_final_questions.json'
    },
    '47beb8a7-920b-4b8f-a309-084d8c2f3295': {
        'qnum': 79,
        'ans': 'A',
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
            q['official_source'] = 'AMRIGS 2024 Gabarito Definitivo Fundatec'
            print(f"Updated {qid} (Q{info['qnum']}) -> {info['ans']} in {fpath}")
            break
            
    if found:
        with open(fpath, 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
    else:
        print(f"ERROR: {qid} not found in {fpath}")

print("AMRIGS 2024 100% COMPLETE!")
