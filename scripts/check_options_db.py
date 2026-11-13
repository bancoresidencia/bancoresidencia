import json

with open('data/pending_amp_questions.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

for q in pending:
    if q['code'] in ['AMP-2025-CLM-28322', 'AMP-2025-CIR-2971', 'AMP-2025-OBS-2852', 'AMP-2025-MPS-7040']:
        print(f"\n==================== {q['code']} ====================")
        print(f"STATEMENT: {q['statement'][:150]}...")
        for opt in q['options']:
            print(f"  {opt['letter']}) {opt['text'][:100]}")

