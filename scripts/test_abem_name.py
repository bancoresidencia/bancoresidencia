import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()
cur.execute("SELECT DISTINCT institution, count(*) FROM questions WHERE institution LIKE '%Progresso%' OR institution LIKE '%ABEM%' GROUP BY institution")
for r in cur.fetchall():
    print(r)
conn.close()
