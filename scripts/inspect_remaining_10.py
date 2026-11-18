import json
import os
import pypdf
import re

with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

with open('data/matched_hub_2016.json', 'r', encoding='utf-8') as f:
    matched = json.load(f)

matched_ids = {m['id'] for m in matched}
unmatched = [q for q in pendings if q['id'] not in matched_ids]

print(f"Unmatched: {len(unmatched)}")
for u in unmatched:
    print(f"\n[{u['code']}] {u['statement']}")
