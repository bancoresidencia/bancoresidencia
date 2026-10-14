import sqlite3
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('data/gabaritos_nacional.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = c.fetchall()
print('Tables in gabaritos_nacional.db:')
for t in tables:
    c.execute(f"SELECT count(*) FROM {t[0]}")
    cnt = c.fetchone()[0]
    print(f"  - {t[0]}: {cnt} registros")
