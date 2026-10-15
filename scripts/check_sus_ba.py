import glob, json, os

print("=== LEVANTAMENTO SUS-BA NO ACERVO LOCAL ===")
total_sus = 0
total_with = 0

for f in sorted(glob.glob('data/*_final_questions.json')):
    with open(f, 'r', encoding='utf-8') as fp:
        items = json.load(fp)
        sus_ba = [q for q in items if 'SUS-BA' in q.get('institution', '') or 'SUS-BA' in q.get('banca', '') or 'SUSBA' in q.get('code', '')]
        if sus_ba:
            with_ans = sum(1 for q in sus_ba if q.get('correctAnswer') or q.get('correct_answer'))
            total_sus += len(sus_ba)
            total_with += with_ans
            c = sus_ba[0].get('code', '')
            print(f"{os.path.basename(f):32}: {len(sus_ba):4d} total | {with_ans:4d} com gabarito | Ex: {c}")

print("-" * 55)
print(f"Total SUS-BA: {total_with} / {total_sus} ({(total_with/total_sus*100 if total_sus else 0):.1f}%)")
