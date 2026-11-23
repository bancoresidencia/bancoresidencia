import sqlite3
import os

source_db = 'data/supabase_tables/supabase_tables.db'
clean_db = 'data/supabase_tables/supabase_staging_clean.db'

src = sqlite3.connect(source_db)
src.row_factory = sqlite3.Row
src_cur = src.cursor()

dst = sqlite3.connect(clean_db)
dst_cur = dst.cursor()

# Get all tables
src_cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence' AND name != 'questions_curated_staging';")
tables = src_cur.fetchall()

for t_name, t_sql in tables:
    print(f"\nProcessing table: {t_name}...")
    try:
        # Check if already in dst
        dst_cur.execute(f"SELECT count(*) FROM sqlite_master WHERE type='table' AND name='{t_name}';")
        if dst_cur.fetchone()[0] > 0:
            print(f"  Already exists in dst, skipping creation.")
        else:
            dst_cur.execute(t_sql)
            dst.commit()

        src_cur.execute(f"SELECT * FROM {t_name};")
        cols = [d[0] for d in src_cur.description]
        placeholders = ','.join(['?'] * len(cols))
        insert_sql = f"INSERT INTO {t_name} ({','.join(cols)}) VALUES ({placeholders})"

        BATCH_SIZE = 10000
        batch = []
        total = 0
        for row in src_cur:
            batch.append(tuple(row))
            if len(batch) >= BATCH_SIZE:
                dst_cur.executemany(insert_sql, batch)
                dst.commit()
                total += len(batch)
                batch = []
        if batch:
            dst_cur.executemany(insert_sql, batch)
            dst.commit()
            total += len(batch)
        print(f"  -> Cloned {total} rows into {t_name}")
    except Exception as e:
        print(f"  -> Error on table {t_name}: {e}")

# Verify integrity
dst_cur.execute("PRAGMA integrity_check;")
res = dst_cur.fetchall()
print("\nFinal clean DB integrity check:", res)

src.close()
dst.close()
