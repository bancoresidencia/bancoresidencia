import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

# 1. Verificar contagens na tabela questions original
try:
    cur.execute("SELECT count(*) FROM questions WHERE modalidade LIKE '%revalida%'")
    print("questions (modalidade revalida):", cur.fetchone()[0])
except Exception as e:
    print("questions error:", e)

# 2. Verificar contagens em questions_expansion_revalida
try:
    cur.execute("SELECT count(*) FROM questions_expansion_revalida")
    print("questions_expansion_revalida:", cur.fetchone()[0])
except Exception as e:
    print("questions_expansion_revalida error:", e)

# 3. Verificar em provaderesidencia_coleta_parte2.db
try:
    conn_col = sqlite3.connect('data/expansion/provaderesidencia_coleta_parte2.db')
    cur_col = conn_col.cursor()
    cur_col.execute("SELECT name FROM sqlite_master WHERE type='table'")
    print("Tabelas coleta parte 2:", cur_col.fetchall())
    cur_col.execute("SELECT count(*) FROM questoes WHERE modalidade LIKE '%revalida%'")
    print("questoes em coleta_parte2 com modalidade revalida:", cur_col.fetchone()[0])
except Exception as e:
    print("coleta parte 2 error:", e)

# 4. Verificar se 4358 aparece em algum censo anterior ou se são questões que vieram com tipo_prova ou caderno
cur.execute("""
    SELECT count(*) FROM questions_curated_staging 
    WHERE tipo_prova LIKE '%revalida%' 
       OR titulo_caderno LIKE '%revalida%'
""")
print("Staging tipo_prova/titulo_caderno revalida:", cur.fetchone()[0])

# 5. Olhar nas tabelas de staging anteriores ou merged_from_ids
cur.execute("SELECT count(*) FROM questions_curated_staging WHERE source_tables LIKE '%revalida%'")
print("Staging source_tables LIKE %revalida%:", cur.fetchone()[0])

conn.close()

