import sqlite3
import os

dbs = ['data/provaderesidencia_coleta_parte2.db', 'data/supabase_tables.db', 'data/curated_questions.db']
for db_path in dbs:
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"{db_path}: {tables}")
            for t in tables:
                try:
                    cursor.execute(f"SELECT * FROM {t} WHERE code LIKE 'HMG-2026%' LIMIT 1")
                    row = cursor.fetchone()
                    if row:
                        cursor.execute(f"PRAGMA table_info({t})")
                        cols = [c[1] for c in cursor.fetchall()]
                        print(f"  -> Found in table {t}!")
                        print(f"     Columns: {cols}")
                        print(f"     Sample: code={row[cols.index('code')]}, correct_answer={row[cols.index('correct_answer')] if 'correct_answer' in cols else 'N/A'}")
                        
                        # Count total HMG 2026
                        cursor.execute(f"SELECT COUNT(*), COUNT(CASE WHEN correct_answer IS NOT NULL AND trim(correct_answer) != '' THEN 1 END) FROM {t} WHERE code LIKE 'HMG-2026%'")
                        c_tot, c_ans = cursor.fetchone()
                        print(f"     Count in {t}: total={c_tot}, with_ans={c_ans}")
                except Exception as e:
                    pass
            conn.close()
        except Exception as err:
            print(f"Error {db_path}: {err}")

