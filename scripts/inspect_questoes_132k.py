import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print(f"Tables in data/questoes_132k.db: {tables}")

for t in tables:
    count = conn.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
    print(f"Table {t}: {count} rows")
    cols = [r[1] for r in conn.execute(f"PRAGMA table_info({t})").fetchall()]
    print(f"  Columns: {cols}")

conn.close()
