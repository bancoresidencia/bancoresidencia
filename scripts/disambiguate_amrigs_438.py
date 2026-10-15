import glob, json

for f in glob.glob('data/*_final_questions.json'):
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == 2018:
            stmt = q.get('statement', '')
            if 'hérnia inguinal' in stmt.lower() or 'tuberculose bacilífera' in stmt.lower():
                opts_summary = [f"{o['letter']}: {o['text'][:35]}" for o in q.get('options', [])]
                print(f"File: {f} | ID: {q.get('id')} | Current QNUM: {q.get('question_number')}")
                print(f"  Statement: {stmt[:90]}...")
                print(f"  Options: {opts_summary}")
