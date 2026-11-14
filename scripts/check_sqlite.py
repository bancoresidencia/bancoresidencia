import sqlite3, os

for db_name in ['provaderesidencia_coleta_parte2.db', 'supabase_tables.db']:
    if os.path.exists(db_name):
        conn = sqlite3.connect(db_name)
        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        print(f"=== DB: {db_name} === Tables: {tables}")
        for t in tables[:5]:
            count = conn.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
            print(f"  Table {t}: {count} rows")
        conn.close()
