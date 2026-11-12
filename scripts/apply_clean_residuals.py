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

cleaned_count = 0
cleaned_ids = []

print("=" * 80)
print("🚀 APLICANDO HIGIENIZAÇÃO DE FRASES RESIDUAIS NA STAGING")
print("=" * 80)

with db:
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
                
            cleaned = re.sub(r'\s{2,}', ' ', cleaned)
            cleaned = re.sub(r'\(\s*\)', '', cleaned)
            cleaned = re.sub(r'\[\s*\]', '', cleaned)
            cleaned = re.sub(r'\s+([.,;:!?])', r'\1', cleaned)
            cleaned = cleaned.strip()
            
            db.execute("UPDATE questions_curated_staging SET statement = ? WHERE id = ?", (cleaned, row['id']))
            cleaned_count += 1
            cleaned_ids.append(row['id'])

print(f"✅ Total de enunciados higienizados com sucesso na staging: {cleaned_count}")

# Salvar manifesto de higienização
with open('data/supabase_tables/residual_cleaned_manifest.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "cleaned_count": cleaned_count,
        "cleaned_ids": cleaned_ids
    }, f, indent=2, ensure_ascii=False)

