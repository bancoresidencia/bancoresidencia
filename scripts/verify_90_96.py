import json

with open('data/pending_amp_questions.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

for q in pending:
    if q['code'] in ['AMP-2025-CIR-1946', 'AMP-2025-CIR-4510']:
        print(f"\n==================== {q['code']} ====================")
        print(f"STATEMENT: {q['statement']}")
        print("OPTIONS:")
        for o in q['options']:
            print(f"  {o['letter']}) {o['text']}")

