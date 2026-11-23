import sqlite3

try:
    conn = sqlite3.connect('data/supabase_tables/supabase_tables.db', timeout=30.0)
    cursor = conn.cursor()
    cursor.execute("PRAGMA wal_checkpoint(TRUNCATE);")
    res = cursor.fetchall()
    print("Checkpoint result:", res)
    cursor.execute("PRAGMA integrity_check;")
    check = cursor.fetchall()
    print("Integrity check first 5 rows:", check[:5])
    conn.close()
except Exception as e:
    print("Error:", e)
