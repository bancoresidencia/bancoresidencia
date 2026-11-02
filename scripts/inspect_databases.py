import sqlite3
import os

for db_name in ['data/gabaritos_nacional.db', 'data/provaderesidencia_coleta.db', 'data/questmed_extracted_exams.db']:
    if os.path.exists(db_name):
        print('='*60)
        print(f'Database: {db_name}')
        con = sqlite3.connect(db_name)
        cur = con.cursor()
        tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
        print(f'Tables: {tables}')
        for t in tables[:5]:
            try:
                cnt = cur.execute(f"SELECT count(*) FROM [{t}];").fetchone()[0]
                print(f'  Table [{t}]: {cnt} rows')
                cur.execute(f"SELECT * FROM [{t}] LIMIT 1;")
                cols = [d[0] for d in cur.description]
                print(f'    Columns: {cols}')
            except Exception as e:
                print(f'    Error reading [{t}]: {e}')
        con.close()

