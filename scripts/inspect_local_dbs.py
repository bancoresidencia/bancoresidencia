import sqlite3, os

for p in ['data/questmed_extracted_exams.db', 'data/questoes_132k.db']:
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cur.fetchall()
        print(f"\n{p} -> Tables: {tables}")
        for t in tables[:4]:
            tname = t[0]
            cur.execute(f"SELECT COUNT(*) FROM [{tname}]")
            cnt = cur.fetchone()[0]
            cur.execute(f"PRAGMA table_info([{tname}])")
            cols = [c[1] for c in cur.fetchall()]
            print(f"  [{tname}]: {cnt} rows | Cols: {cols[:8]}")
