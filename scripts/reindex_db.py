import sqlite3

try:
    print("Connecting to database...")
    conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
    cursor = conn.cursor()
    print("Running REINDEX...")
    cursor.execute("REINDEX;")
    conn.commit()
    print("REINDEX finished. Running integrity check...")
    cursor.execute("PRAGMA integrity_check;")
    res = cursor.fetchall()
    print("Integrity check result count:", len(res))
    if len(res) == 1 and res[0][0] == 'ok':
        print("DATABASE FULLY REPAIRED AND OK!")
    else:
        print("First 3 issues:", res[:3])
    conn.close()
except Exception as e:
    print("Error during reindex:", e)
