import sqlite3

conn = sqlite3.connect('data/gabaritos_nacional.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = c.fetchall()
print('Tables:', tables)
for t in tables:
    c.execute(f"SELECT count(*) FROM {t[0]}")
    cnt = c.fetchone()[0]
    print(f"Table {t[0]}: {cnt} rows")
    c.execute(f"SELECT * FROM {t[0]} LIMIT 2")
    sample = c.fetchall()
    print("Sample:", sample)
