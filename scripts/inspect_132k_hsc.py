import sqlite3
import re

conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()

cursor.execute("SELECT code, year, correct_answer, commentary, statement FROM questions WHERE code LIKE 'HSC%'")
rows = cursor.fetchall()

print(f"Total HSC questions in 132k db: {len(rows)}")

with_comm = [r for r in rows if r[3] and r[3].strip()]
print(f"With commentary: {len(with_comm)}")

for code, year, ans, comm, stmt in with_comm[:10]:
    print(f"\n[{code}] Year={year}, Ans={ans}")
    print(f"Commentary: {comm[:200]}")

conn.close()
