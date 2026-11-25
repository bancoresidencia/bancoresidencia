import sqlite3

src = sqlite3.connect('data/supabase_tables/supabase_tables.db')
src.row_factory = sqlite3.Row
src_cur = src.cursor()

dst = sqlite3.connect('data/supabase_tables/supabase_staging_clean.db')
dst_cur = dst.cursor()

recovered = 0
for rowid in range(1, 4000):
    try:
        src_cur.execute("SELECT * FROM official_exams WHERE rowid = ?", (rowid,))
        r = src_cur.fetchone()
        if r:
            cols = [d[0] for d in src_cur.description]
            placeholders = ','.join(['?'] * len(cols))
            dst_cur.execute(f"INSERT OR IGNORE INTO official_exams ({','.join(cols)}) VALUES ({placeholders})", tuple(r))
            recovered += 1
    except:
        pass

dst.commit()
print(f"Recovered {recovered} rows of official_exams into clean DB!")

dst_cur.execute("PRAGMA integrity_check;")
print("Integrity check:", dst_cur.fetchall())

src.close()
dst.close()
