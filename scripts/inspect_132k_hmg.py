import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(questions)")
cols = [c[1] for c in cursor.fetchall()]
print("Columns:", cols)

cursor.execute("SELECT code, statement, commentary, options FROM questions WHERE code LIKE 'HMG-2026%' AND commentary IS NOT NULL AND trim(commentary) != '' LIMIT 1")
row = cursor.fetchone()
if row:
    print("Found resolved question:")
    print("Code:", row[0])
    print("Statement preview:", row[1][:150])
    print("Commentary preview:", row[2][:250])
conn.close()

