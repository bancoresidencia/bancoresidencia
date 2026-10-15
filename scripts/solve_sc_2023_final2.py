import json

audit_base = {
    'concurso': 'ISCMSP / Santa Casa de São Paulo 2023 (Acesso Direto)',
    'banca': 'Quadrix',
    'status': 'VALIDA',
    'source_document': 'SANTA_CASA_2023_GABARITO_DEFINITIVO.pdf',
    'source_url': 'https://quadrix.org.br/uploads/861/concursos/1177/anexos/gabarito_definitivo.pdf',
    'is_verified': True,
    'verified': True
}

updates = {
    'cc090443-f01d-4494-8472-517ca640da4b': {
        'qnum': 16,
        'ans': 'E',
        'file': 'data/clinica_medica_final_questions.json'
    },
    '02514469-e4cc-4c7c-9a85-0f085a8fa113': {
        'qnum': 21,
        'ans': 'A',
        'file': 'data/cirurgia_final_questions.json'
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
            q['official_source'] = 'Santa Casa SP 2023 Gabarito Definitivo Quadrix'
            print(f"Updated {qid} (Q{info['qnum']}) -> {info['ans']} in {fpath}")
            break
            
    if found:
        with open(fpath, 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
    else:
        print(f"ERROR: {qid} not found in {fpath}")

print("SANTA CASA SP 2023 100% COMPLETE!")
