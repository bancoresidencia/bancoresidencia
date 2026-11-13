import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

# Pegar 10 IDs não mapeados
cur.execute("""
    SELECT id 
    FROM supabase_live_questions 
    WHERE supabase_table = 'questions_revalida'
      AND id NOT IN (SELECT clean_id FROM ssot_id_mapping)
    LIMIT 10
""")
unmapped_ids = [r[0] for r in cur.fetchall()]
print("Amostra de 10 IDs não mapeados:", unmapped_ids)

# Verificar se esses IDs existem em alguma outra tabela de supabase_tables.db
tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    cols = [col[1] for col in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    if 'id' in cols:
        cur.execute(f"SELECT count(*) FROM {t} WHERE id IN ({','.join(['?']*len(unmapped_ids))})", unmapped_ids)
        cnt = cur.fetchone()[0]
        if cnt > 0:
            print(f"  Encontrado {cnt} IDs em {t}!")
    if 'merged_from_ids' in cols:
        for uid in unmapped_ids:
            cur.execute(f"SELECT count(*) FROM {t} WHERE merged_from_ids LIKE ?", (f"%{uid}%",))
            c_merged = cur.fetchone()[0]
            if c_merged > 0:
                print(f"  Encontrado {uid} em {t}.merged_from_ids!")

conn.close()
