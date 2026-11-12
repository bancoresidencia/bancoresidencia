import sqlite3
import json

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

print("=" * 80)
print("🔍 BUSCANDO QUESTÕES COM IMAGENS RELACIONADAS ÀS 4 IMAGENS ENVIADAS")
print("=" * 80)

def search_questions(term):
    query = f"""
        SELECT id, banca, year, statement, images 
        FROM questions_curated_staging 
        WHERE images IS NOT NULL AND images != '[]' AND images != '' 
          AND (statement LIKE ? OR statement LIKE ?)
        LIMIT 5
    """
    return db.execute(query, (f"%{term}%", f"%{term.lower()}%")).fetchall()

terms = ['volvo', 'coto umbilical', 'onfalite', 'taquipneia transitória', 'membrana hialina', 'polidrâmnio']

for t in terms:
    res = search_questions(t)
    print(f"\n--- Termo: {t} ({len(res)} encontradas) ---")
    for r in res[:2]:
        print(f"ID: {r['id']} ({r['banca']} {r['year']})")
        print(f"Statement: {r['statement'][:120]}...")
        print(f"Images: {r['images']}")

