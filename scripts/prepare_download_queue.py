import sqlite3
import json
import os

DB_PATH = 'data/supabase_tables/supabase_tables.db'
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 1. Statement remote images
stmt_rows = cursor.execute("""
    SELECT id, banca, year, images 
    FROM questions_curated_staging 
    WHERE images LIKE '%http%'
""").fetchall()

# 2. Options remote images
opt_rows = cursor.execute("""
    SELECT id, banca, year, options 
    FROM questions_curated_staging 
    WHERE options LIKE '%http%'
""").fetchall()

url_to_questions = {}
for r in stmt_rows:
    try:
        imgs = json.loads(r['images'] or '[]')
        for idx, u in enumerate(imgs):
            if isinstance(u, str) and u.startswith('http'):
                url_to_questions.setdefault(u, []).append({'id': r['id'], 'type': 'statement', 'index': idx, 'banca': r['banca'], 'year': r['year']})
    except:
        pass

for r in opt_rows:
    try:
        opts = json.loads(r['options'] or '[]')
        for idx, o in enumerate(opts):
            if isinstance(o.get('text'), str) and o['text'].startswith('http'):
                u = o['text']
                url_to_questions.setdefault(u, []).append({'id': r['id'], 'type': 'option', 'index': idx, 'letter': o.get('letter'), 'banca': r['banca'], 'year': r['year']})
    except:
        pass

print(f"Total de questões com imagens remotas no enunciado: {len(stmt_rows)}")
print(f"Total de questões com imagens remotas nas alternativas: {len(opt_rows)}")
print(f"Total de URLs únicas a baixar e processar: {len(url_to_questions)}")

# Check domains
domains = {}
for u in url_to_questions:
    d = u.split('/')[2]
    domains[d] = domains.get(d, 0) + 1
print("Domínios:", domains)
