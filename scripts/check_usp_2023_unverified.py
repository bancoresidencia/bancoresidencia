import glob, json

files = glob.glob('data/*_final_questions.json')
usp_2023 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        inst = q.get('institution', '')
        yr = q.get('year')
        if 'HCFMUSP' in str(inst).upper() and str(yr) == '2023':
            usp_2023.append((f, q))

print(f"Total USP/HCFMUSP 2023 questions: {len(usp_2023)}")
verified = [q for f, q in usp_2023 if q.get('official_audit', {}).get('verified') or q.get('audit_trail')]
unverified = [(f, q) for f, q in usp_2023 if not (q.get('official_audit', {}).get('verified') or q.get('audit_trail'))]
print(f"Verified: {len(verified)}, Unverified: {len(unverified)}")

for f, q in unverified[:10]:
    spec = f.split('\\')[-1].replace('_final_questions.json', '')
    num = q.get('question_number') or q.get('number') or q.get('official_audit', {}).get('question_number')
    print(f"Spec: {spec} | ID: {q.get('id')} | Num: {num} | Code: {q.get('code')} | Text: {q.get('statement', '')[:60]}...")
