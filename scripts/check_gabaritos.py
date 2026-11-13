import sqlite3
import json

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
c = conn.cursor()

total = c.execute('SELECT count(id) FROM questions_curated_staging').fetchone()[0]
null_empty = c.execute("SELECT count(id) FROM questions_curated_staging WHERE correct_answer IS NULL OR trim(correct_answer) = ''").fetchone()[0]
anuladas = c.execute("SELECT count(id) FROM questions_curated_staging WHERE is_anulada = 1 OR upper(trim(correct_answer)) = 'ANULADA'").fetchone()[0]
dist = c.execute("SELECT upper(trim(correct_answer)), count(id) FROM questions_curated_staging GROUP BY upper(trim(correct_answer)) ORDER BY count(id) DESC LIMIT 20").fetchall()

print(json.dumps({
    'total': total,
    'null_empty': null_empty,
    'anuladas': anuladas,
    'distribution': dist
}, indent=2, ensure_ascii=False))
conn.close()

