import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
c = conn.cursor()
c.execute("SELECT id, code, especialidade, commentary_tier FROM questions_curated_staging WHERE especialidade = 'Clínica Médica' LIMIT 5")
for r in c.fetchall():
    print(r)
