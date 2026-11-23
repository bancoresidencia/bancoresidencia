import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cursor = conn.cursor()
cursor.execute("SELECT name, rootpage FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables and rootpages:")
for t, rp in tables:
    print(f"  Table: {t}, rootpage: {rp}")

for t, rp in tables:
    try:
        cursor.execute(f"SELECT count(*) FROM {t};")
        cnt = cursor.fetchone()[0]
        print(f"  -> Table {t}: {cnt} rows read successfully!")
    except Exception as e:
        print(f"  -> Table {t}: ERROR: {e}")

conn.close()
