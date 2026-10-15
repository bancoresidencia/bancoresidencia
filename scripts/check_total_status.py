import json, glob, sys
from collections import defaultdict
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
total_all = 0
total_with_ans = 0
total_without_ans = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    total_all += len(qs)
    for q in qs:
        ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
        if is_anul or ans in ['A', 'B', 'C', 'D', 'E']:
            total_with_ans += 1
        else:
            total_without_ans += 1

print(f"Total across all 7 JSON files: {total_all}")
print(f"With answers: {total_with_ans} ({total_with_ans/total_all*100:.2f}%)")
print(f"Without answers: {total_without_ans} ({total_without_ans/total_all*100:.2f}%)")
