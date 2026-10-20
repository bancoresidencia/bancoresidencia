import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/questmed_bundle.js', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'function se\(\)|const se\s*=|let se\s*=|var se\s*=', text)
if m:
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 300)
    print("=== DEFINICAO DE se ===")
    print(text[start:end])
else:
    # search where 'signUp' is in text
    for m in list(re.finditer(r'signUp', text))[:3]:
        start = max(0, m.start() - 150)
        end = min(len(text), m.end() + 150)
        print("SIGNUP SNIPPET:", text[start:end])
        print("-" * 50)
