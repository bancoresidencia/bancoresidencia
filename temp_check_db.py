import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print('Tables:', c.fetchall())

try:
    c.execute("SELECT id, banca, ano, enunciado FROM questoes WHERE enunciado LIKE '%parto cesárea por sofrimento fetal%' LIMIT 5;")
    rows = c.fetchall()
    print('Found in questoes:', len(rows))
    for r in rows:
        print(r[0], r[1], r[2], r[3][:100])
except Exception as e:
    print('Error:', e)

