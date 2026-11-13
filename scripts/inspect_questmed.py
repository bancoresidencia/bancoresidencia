import sqlite3

conn = sqlite3.connect('data/questmed_extracted_exams.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Tables in questmed_extracted_exams.db:", tables)

for t in tables:
    try:
        cursor.execute(f"SELECT COUNT(*), COUNT(CASE WHEN correct_answer IS NOT NULL AND trim(correct_answer) != '' THEN 1 END) FROM {t} WHERE code LIKE 'HSC%'")
        tot, ans = cursor.fetchone()
        print(f"Table {t}: total HSC = {tot}, with ans = {ans}")
    except Exception as e:
        print(f"Error {t}: {e}")

conn.close()
