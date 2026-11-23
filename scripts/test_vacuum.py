import sqlite3

try:
    print("Testing VACUUM INTO...")
    conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
    cursor = conn.cursor()
    cursor.execute("VACUUM INTO 'data/supabase_tables/supabase_tables_clean.db';")
    print("VACUUM INTO completed successfully!")
    conn.close()
except Exception as e:
    print("Error with VACUUM INTO:", e)
