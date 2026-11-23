import sqlite3
import glob
import os

print("--- SCANNING SQLITE DATABASES ---")
for db_path in sorted(glob.glob('*.db') + glob.glob('*/*.db') + glob.glob('*/*/*.db')):
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cur.fetchall() if not t[0].startswith('sqlite_')]
        print(f"\n[DATABASE] {db_path} (size: {os.path.getsize(db_path)/(1024*1024):.1f} MB)")
        for t in tables[:8]:
            try:
                cur.execute(f'SELECT count(*) FROM "{t}"')
                total = cur.fetchone()[0]
                cur.execute(f'PRAGMA table_info("{t}")')
                cols = [c[1] for c in cur.fetchall()]
                
                comm_col = next((c for c in ['commentary', 'comentario', 'comentarios', 'comentario_ouro'] if c in cols), None)
                comm_count = 0
                if comm_col:
                    cur.execute(f'SELECT count(*) FROM "{t}" WHERE "{comm_col}" IS NOT NULL AND length(trim("{comm_col}")) > 10')
                    comm_count = cur.fetchone()[0]
                
                # Check for correct_answer
                ans_col = next((c for c in ['correctAnswer', 'correct_answer', 'gabarito'] if c in cols), None)
                ans_count = 0
                if ans_col:
                    cur.execute(f'SELECT count(*) FROM "{t}" WHERE "{ans_col}" IS NOT NULL AND trim("{ans_col}") != ""')
                    ans_count = cur.fetchone()[0]

                print(f"  • Tabela: {t:<30} Total: {total:<8} | Gabarito: {ans_count:<8} | Comentários: {comm_count:<8}")
            except Exception as te:
                print(f"  • Tabela: {t} (erro: {te})")
    except Exception as dbe:
        pass
