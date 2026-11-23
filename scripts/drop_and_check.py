import sqlite3

try:
    conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
    cursor = conn.cursor()
    print("Dropping idx_questions_has_images...")
    cursor.execute("DROP INDEX IF EXISTS idx_questions_has_images;")
    conn.commit()
    print("Dropped. Running quick check...")
    cursor.execute("PRAGMA quick_check;")
    qc = cursor.fetchall()
    print("Quick check result:", qc[:5])
    conn.close()
except Exception as e:
    print("Error:", e)
