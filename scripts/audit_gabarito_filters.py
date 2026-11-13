import sqlite3
import json

db_path = 'data/supabase_tables/supabase_tables.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Find question
cur.execute("""
    SELECT id, code, institution, banca, year, type, options, correct_answer, commentary, is_anulada, source_tables
    FROM questions_curated_staging
    WHERE statement LIKE '%infertilidade primária há 3 anos%'
    LIMIT 5
""")
rows = cur.fetchall()
print(f"Found {len(rows)} rows")
for r in rows:
    print("=" * 60)
    print("ID:", r[0])
    print("Code:", r[1])
    print("Institution:", r[2], "Banca:", r[3], "Year:", r[4])
    print("Type:", r[5])
    print("Is anulada:", r[9])
    print("Correct answer:", repr(r[7]))
    print("Source tables:", r[10])
    print("Options type:", type(r[6]))
    print("Options content:")
    try:
        parsed = json.loads(r[6])
        print("Parsed JSON type:", type(parsed))
        if isinstance(parsed, list):
            for i, opt in enumerate(parsed):
                print(f"  [{i}]: {repr(opt)[:120]}")
        elif isinstance(parsed, dict):
            for k, v in parsed.items():
                print(f"  {k}: {repr(v)[:120]}")
        else:
            print("  Raw parsed:", parsed)
    except Exception as e:
        print("  JSON parse error:", e)
        print("  Raw:", repr(r[6])[:200])

    print("Commentary len:", len(r[8]) if r[8] else 0)
    if r[8]:
        print("Commentary preview:", r[8][:200])
