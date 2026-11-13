import sqlite3
import re

conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()
cursor.execute("SELECT code, correct_answer, commentary, statement FROM questions WHERE code LIKE 'HMG-2026%'")
rows = cursor.fetchall()

print(f"Total HMG 2026 questions: {len(rows)}")

q_numbers = []
for code, ans, comm, stmt in rows:
    if comm:
        m = re.search(r'Q#(\d+)', comm)
        if m:
            q_num = int(m.group(1))
            q_numbers.append((q_num, code, ans, stmt[:60]))

q_numbers.sort(key=lambda x: x[0])
print(f"Found {len(q_numbers)} questions with Q# in commentary:")
for q_num, code, ans, stmt in q_numbers:
    print(f"Q#{q_num:02d} -> Code: {code} | Ans: {ans} | Stmt: {stmt}")

conn.close()

