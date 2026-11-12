import sqlite3
import json
import re

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)['catalog']

CLEANABLE_PATTERNS = [
    r'\((?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es?)[^)]*\)',
    r'\[(?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es?)[^\]]*\]',
    r'\bconforme\s+(?:a\s+)?(?:imagem|figura|foto)\s+(?:do\s+caderno\s+de\s+quest[õo]es?|abaixo|a\s+seguir)\b',
    r'\bque\s+pode\s+ser\s+vist[ao]\s+na\s+figura\s+(?:abaixo|a\s+seguir)\b',
    r'\((?:imagem|figura)\s+(?:abaixo|a\s+seguir)\)',
    r'\[(?:imagem|figura)\s+(?:abaixo|a\s+seguir)\]'
]

cleaned_items = []

for item in cat:
    row = db.execute("SELECT id, statement FROM questions_curated_staging WHERE id = ?", (item['id'],)).fetchone()
    if not row or not row['statement']: continue
    stmt = row['statement']
    
    matches = []
    for pat in CLEANABLE_PATTERNS:
        m = re.findall(pat, stmt, re.IGNORECASE)
        if m: matches.extend(m)
        
    if matches:
        cleaned = stmt
        for pat in CLEANABLE_PATTERNS:
            cleaned = re.sub(pat, '', cleaned, flags=re.IGNORECASE)
            
        # Limpeza de pontuação e espaços duplos
        cleaned = re.sub(r'\s{2,}', ' ', cleaned)
        cleaned = re.sub(r'\(\s*\)', '', cleaned)
        cleaned = re.sub(r'\[\s*\]', '', cleaned)
        cleaned = re.sub(r'\s+([.,;:!?])', r'\1', cleaned)
        cleaned = cleaned.strip()
        
        cleaned_items.append({
            "id": row['id'],
            "matches": matches,
            "original": stmt,
            "cleaned": cleaned
        })

print(f"Total de questões com frases remanescentes para higienização: {len(cleaned_items)}")
print("\nAmostra de 4 limpezas:")
for ci in cleaned_items[:4]:
    print("=" * 60)
    print("ID:", ci['id'])
    print("Frases removidas:", ci['matches'])
    print("Original:", ci['original'][:160] + "...")
    print("Limpo:   ", ci['cleaned'][:160] + "...")

