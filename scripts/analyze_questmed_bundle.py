import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/questmed_bundle.js', encoding='utf-8') as f:
    text = f.read()

# 1. API Endpoints
apis = set(re.findall(r'[\'\"`](/api/[a-zA-Z0-9_\-\/]+)[\'\"`]', text))
print("=== APIs ENCONTRADAS NO BUNDLE ===")
for a in sorted(apis):
    print("  ", a)

# 2. Rotas do Router
routes = set(re.findall(r'path:\s*[\'\"`]([^\'\"`]+)[\'\"`]', text))
print("\n=== ROTAS DO REACT ROUTER ===")
for r in sorted(routes):
    print("  ", r)

# 3. Chunks adicionais carregados dinamicamente (lazy loading)
chunks = set(re.findall(r'[\'\"`](/assets/[a-zA-Z0-9_\-\.]+\.js)[\'\"`]', text))
print("\n=== OUTROS CHUNKS JS / ASSETS ===")
for c in sorted(chunks):
    print("  ", c)

# 4. Contexto em torno de 'student'
print("\n=== TRECHOS COM 'student' ===")
for m in re.finditer(r'student', text, re.IGNORECASE):
    start = max(0, m.start() - 60)
    end = min(len(text), m.end() + 60)
    snippet = text[start:end].replace('\n', ' ')
    print("  ...", snippet, "...")
    if m.start() > 30000: # limitar print
        break
