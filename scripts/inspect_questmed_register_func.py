import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/questmed_bundle.js', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'register-with-tenant', text)
if m:
    start = max(0, m.start() - 500)
    end = min(len(text), m.end() + 500)
    print("=== TRECHO DO REGISTRO ===")
    print(text[start:end])
