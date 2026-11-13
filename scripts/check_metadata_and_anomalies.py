import sqlite3
import json

db_path = 'data/supabase_tables/supabase_tables.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. 1.615 com options vazias
cur.execute("""
    SELECT is_anulada, correct_answer, count(*)
    FROM questions_curated_staging
    WHERE type = 'Múltipla escolha' AND (options IS NULL OR options IN ('', 'null', '[]', '{}'))
    GROUP BY is_anulada, correct_answer
""")
print("1.615 com options vazias por is_anulada e correct_answer:")
for r in cur.fetchall():
    print(" ", r)

# 2. Metadados preenchidos vs vazios
print("\nMetadados gerais em questions_curated_staging:")
fields = ['especialidade', 'tema', 'foco', 'subfoco', 'institution', 'banca', 'year', 'difficulty']
for f in fields:
    cur.execute(f"SELECT count(*) FROM questions_curated_staging WHERE {f} IS NOT NULL AND {f} != ''")
    cnt = cur.fetchone()[0]
    print(f"  {f}: {cnt:,} preenchidos ({cnt/254192*100:.2f}%)")

# 3. Análise de '!' no correct_answer
cur.execute("SELECT id, code, statement, options, commentary, is_anulada FROM questions_curated_staging WHERE correct_answer = '!' LIMIT 3")
print("\nExemplos de correct_answer = '!':")
for r in cur.fetchall():
    print("  ID:", r[0], "Code:", r[1], "Is_anulada:", r[5])
    print("  Options:", r[3][:100] if r[3] else "None")
    print("  Statement:", r[2][:100] if r[2] else "None")
    print("  Comm:", r[4][:100] if r[4] else "None")

# 4. Análise de números no correct_answer
cur.execute("SELECT id, code, statement, options, commentary, correct_answer FROM questions_curated_staging WHERE correct_answer IN ('38','39','40','10','37','7','8','9','95') LIMIT 3")
print("\nExemplos de correct_answer numérico:")
for r in cur.fetchall():
    print("  ID:", r[0], "Code:", r[1], "Gab:", r[5])
    print("  Statement:", r[2][:100] if r[2] else "None")
