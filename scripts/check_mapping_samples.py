import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

cur.execute("SELECT id FROM supabase_live_questions WHERE supabase_table = 'questions_revalida' LIMIT 5")
print("Exemplo live_questions id:", cur.fetchall())

cur.execute("SELECT clean_id, ssot_id FROM ssot_id_mapping WHERE clean_id LIKE '%revalida%' OR ssot_id LIKE '%revalida%' LIMIT 5")
print("Exemplo ssot_id_mapping:", cur.fetchall())

cur.execute("SELECT count(*) FROM supabase_live_questions")
print("Total supabase_live_questions:", cur.fetchone()[0])

cur.execute("SELECT count(*) FROM ssot_id_mapping")
print("Total ssot_id_mapping:", cur.fetchone()[0])

conn.close()
