import sqlite3

conn = sqlite3.connect('file:data/questoes_132k.db?mode=ro', uri=True)
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM questions WHERE correct_answer IS NULL OR correct_answer = ''")
missing_cnt = cur.fetchone()[0]
print(f"Missing in local questoes_132k.db: {missing_cnt}")
conn.close()
