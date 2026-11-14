import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()
cur.execute("SELECT code, correct_answer, statement, options FROM questions WHERE (institution LIKE '%Caetano%' or code LIKE 'USCS%') AND year = 2025 AND correct_answer is not null and correct_answer != ''")
rows = cur.fetchall()
print(f"Total 2025 com gabarito: {len(rows)}")
for r in rows:
    print(f"[{r[0]}] Gab: {r[1]}")
    print(f"  Enunciado: {r[2][:120]}...")
conn.close()
