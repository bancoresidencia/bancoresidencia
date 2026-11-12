import sqlite3, json, re

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)['catalog']

RESIDUAL_PATTERNS = [
    r'\((?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^)]*\)',
    r'\[(?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^\]]*\]',
    r'\bconforme\s+(?:a\s+)?(?:imagem|figura|foto)\s+(?:do\s+caderno\s+de\s+quest[õo]es|abaixo|a\s+seguir)\b',
    r'\bque\s+pode\s+ser\s+vist[ao]\s+na\s+figura\s+(?:abaixo|a\s+seguir)\b',
    r'\(imagem\s+(?:abaixo|a\s+seguir)\)',
    r'\[imagem\s+(?:abaixo|a\s+seguir)\]'
]

cur = db.cursor()
found = []
for q in cat:
    row = cur.execute('SELECT id, statement, options, correct_answer FROM questions_curated_staging WHERE id = ?', (q['id'],)).fetchone()
    if not row or not row['statement']: continue
    stmt = row['statement']
    matched_pats = []
    for p in RESIDUAL_PATTERNS:
        m = re.findall(p, stmt, re.IGNORECASE)
        if m: matched_pats.extend(m)
    if matched_pats:
        found.append({
            'id': row['id'],
            'statement': stmt,
            'options': row['options'],
            'gabarito': row['correct_answer'],
            'patterns': matched_pats
        })

print(f"Total questions with residual patterns: {len(found)}")
for item in found[:6]:
    print("=" * 60)
    print("ID:", item['id'])
    print("Patterns:", item['patterns'])
    print("Statement:", item['statement'][:250])
    print("Options:", item['options'][:200])
    print("Gabarito:", item['gabarito'])

