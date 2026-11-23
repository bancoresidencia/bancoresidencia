import sqlite3
import os

source_db = 'data/supabase_tables/supabase_tables.db'
clean_db = 'data/supabase_tables/supabase_staging_clean.db'

if os.path.exists(clean_db):
    os.remove(clean_db)

src = sqlite3.connect(source_db)
src.row_factory = sqlite3.Row
src_cur = src.cursor()

# Get DDL of questions_curated_staging
src_cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='questions_curated_staging';")
ddl = src_cur.fetchone()[0]

dst = sqlite3.connect(clean_db)
dst_cur = dst.cursor()
dst_cur.execute(ddl)

print("Cloning questions_curated_staging rows...")
src_cur.execute("SELECT * FROM questions_curated_staging;")

cols = [d[0] for d in src_cur.description]
placeholders = ','.join(['?'] * len(cols))
insert_sql = f"INSERT INTO questions_curated_staging ({','.join(cols)}) VALUES ({placeholders})"

BATCH_SIZE = 10000
batch = []
total = 0
for row in src_cur:
    batch.append(tuple(row))
    if len(batch) >= BATCH_SIZE:
        dst_cur.executemany(insert_sql, batch)
        dst.commit()
        total += len(batch)
        print(f"  Cloned {total} rows...")
        batch = []

if batch:
    dst_cur.executemany(insert_sql, batch)
    dst.commit()
    total += len(batch)

print(f"Total rows cloned successfully: {total}")

# Create only necessary clean indexes
print("Creating indexes on clean db...")
dst_cur.execute("CREATE INDEX idx_qcs_id ON questions_curated_staging(id);")
dst.commit()

# Verify integrity of clean db
dst_cur.execute("PRAGMA integrity_check;")
res = dst_cur.fetchall()
print("Integrity check on clean DB:", res)

src.close()
dst.close()
