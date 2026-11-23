import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cursor = conn.cursor()
cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='questions_curated_staging';")
indexes = cursor.fetchall()
print("Indexes on questions_curated_staging:")
for name, sql in indexes:
    print(f"  {name}: {sql}")

conn.close()
