import json

with open('data/ready_to_commit_hub_2016.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

counts = {}
for d in data:
    ans = d['correct_answer']
    counts[ans] = counts.get(ans, 0) + 1

print(f"Total: {len(data)}")
print("Distribution of correct_answer:", counts)
for d in data:
    if d['correct_answer'] == 'ANULADA':
        print(f"  Anulada: {d['code']} (Cebraspe {d['cebraspe_ans']} in {d['pdf']} Item {d['item_num']})")
