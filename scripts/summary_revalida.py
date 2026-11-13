import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

print("--- DISTRIBUIÇÃO POR INSTITUIÇÃO (REVALIDA) ---")
cur.execute("""
    SELECT institution, count(*) 
    FROM questions_curated_staging 
    WHERE modalidade = 'Revalida' 
    GROUP BY institution 
    ORDER BY count(*) DESC
""")
for inst, c in cur.fetchall():
    print(f"{inst:50s} : {c:5d}")

print("\n--- DISTRIBUIÇÃO POR ANO (REVALIDA) ---")
cur.execute("""
    SELECT year, count(*) 
    FROM questions_curated_staging 
    WHERE modalidade = 'Revalida' 
    GROUP BY year 
    ORDER BY year DESC
""")
for yr, c in cur.fetchall():
    print(f"Ano {yr} : {c:5d}")

conn.close()

