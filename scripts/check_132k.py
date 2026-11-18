import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()
cur.execute('PRAGMA table_info(questions)')
cols = [c[1] for c in cur.fetchall()]
print('Columns in questions_132k.db:', cols)
cur.execute('SELECT COUNT(*) FROM questions WHERE correct_answer IS NOT NULL AND correct_answer != ""')
print('With answer:', cur.fetchone()[0])
cur.execute('SELECT COUNT(*) FROM questions WHERE correct_answer IS NULL OR correct_answer = ""')
print('Missing answer:', cur.fetchone()[0])
