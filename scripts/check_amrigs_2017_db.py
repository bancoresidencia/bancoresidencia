import glob, json

files = glob.glob('data/*_final_questions.json')
amrigs_2017 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        inst = q.get('institution', '')
        yr = q.get('year')
        if 'AMRIGS' in str(inst).upper() and str(yr) == '2017':
            amrigs_2017.append(q)

print(f"Total AMRIGS 2017 questions: {len(amrigs_2017)}")
for i, q in enumerate(amrigs_2017[:15]):
    text = q.get('text', '') or q.get('enunciado', '')
    print(f"{i+1}. ID: {q.get('id')} | Number: {q.get('question_number') or q.get('number')} | TEXT: {text[:100]}...")
