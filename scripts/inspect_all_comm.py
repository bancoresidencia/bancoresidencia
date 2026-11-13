import sqlite3
import re

conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()
cursor.execute("SELECT code, especialidade, correct_answer, commentary FROM questions WHERE code LIKE 'HMG-2026%' AND commentary IS NOT NULL AND trim(commentary) != ''")
rows = cursor.fetchall()
print(f"Total with commentary: {len(rows)}")
for code, esp, ans, comm in rows[:15]:
    m = re.search(r'\[([^\]]+)\]', comm)
    tag = m.group(1) if m else comm[:40]
    print(f"{code} ({esp}) [{ans}] -> {tag}")
conn.close()

