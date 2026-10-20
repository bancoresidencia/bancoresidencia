import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/questmed_bundle.js', encoding='utf-8') as f:
    text = f.read()

print("=== REGISTRO E LOGIN NO QUESTMED ===")
for m in re.finditer(r'/api/auth[a-zA-Z0-9_\-\/]*', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 100)
    print("API AUTH:", text[start:end])
    print("-" * 50)

# Procurar onde o token é salvo (localStorage, cookie, Supabase?)
print("\n=== STORAGE / TOKEN ===")
for m in re.finditer(r'(?:localStorage|sessionStorage)\.(?:setItem|getItem)\([\'\"`]([^\'\"`]+)[\'\"`]', text):
    print("Storage key:", m.group(1))

# Procurar se usa Supabase, Firebase ou backend próprio
print("\n=== CLIENTES DE BACKEND / AUTH ===")
for keyword in ['supabase', 'firebase', 'axios', 'headers', 'authorization', 'bearer']:
    matches = list(re.finditer(keyword, text, re.IGNORECASE))
    print(f"Keyword '{keyword}': {len(matches)} ocorrencias")
