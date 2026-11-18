import os, sqlite3

db_path = 'data/provaderesidencia_coleta_parte2.db'
print('Checking:', db_path, 'Exists:', os.path.exists(db_path))

for p in ['data/provaderesidencia_coleta_parte2.db', 'supabase_tables.db']:
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cur.fetchall()
        print(f"\n{p} Tables: {tables}")
        for t in tables[:3]:
            tname = t[0]
            cur.execute(f"SELECT COUNT(*) FROM [{tname}]")
            cnt = cur.fetchone()[0]
            print(f"  - {tname}: {cnt} rows")
