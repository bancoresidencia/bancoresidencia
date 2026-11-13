import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Tables in questoes_132k.db:", tables)

for t in tables:
    try:
        cursor.execute(f"SELECT COUNT(*), COUNT(CASE WHEN correct_answer IS NOT NULL AND trim(correct_answer) != '' THEN 1 END) FROM {t} WHERE code LIKE 'HMG-2026%'")
        tot, ans = cursor.fetchone()
        if tot > 0:
            print(f"Table {t}: total={tot}, with_ans={ans}")
    except Exception as e:
        print(f"Error in {t}: {e}")

conn.close()

