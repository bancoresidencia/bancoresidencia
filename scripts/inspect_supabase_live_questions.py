import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

print("--- INVESTIGANDO supabase_live_questions (4358 questoes) ---")

cur.execute("""
    SELECT supabase_table, count(*) 
    FROM supabase_live_questions 
    WHERE modalidade LIKE '%revalida%' OR supabase_table LIKE '%revalida%'
    GROUP BY supabase_table
""")
print("Por supabase_table:", cur.fetchall())

# Verificar se essas 4358 questoes estao no ssot_id_mapping
cur.execute("""
    SELECT count(*), count(distinct ssot_id)
    FROM ssot_id_mapping
    WHERE original_id IN (
        SELECT id FROM supabase_live_questions 
        WHERE modalidade LIKE '%revalida%' OR supabase_table LIKE '%revalida%'
    )
""")
print("Mapeamento para ssot_id:", cur.fetchone())

# Onde foram parar essas 4358 questoes em questions_curated_staging?
cur.execute("""
    SELECT s.modalidade, count(*)
    FROM ssot_id_mapping m
    JOIN questions_curated_staging s ON m.ssot_id = s.id
    WHERE m.original_id IN (
        SELECT id FROM supabase_live_questions 
        WHERE modalidade LIKE '%revalida%' OR supabase_table LIKE '%revalida%'
    )
    GROUP BY s.modalidade
""")
print("Modalidade atual na SSOT das questoes que eram Revalida no supabase_live_questions:")
for r in cur.fetchall():
    print(" ", r)

# Como foi feita a deduplicação delas? Quantas viraram distinct vs merged?
cur.execute("""
    SELECT s.curation_status, count(*)
    FROM ssot_id_mapping m
    JOIN questions_curated_staging s ON m.ssot_id = s.id
    WHERE m.original_id IN (
        SELECT id FROM supabase_live_questions 
        WHERE modalidade LIKE '%revalida%' OR supabase_table LIKE '%revalida%'
    )
    GROUP BY s.curation_status
""")
print("\nCuration status na SSOT:")
for r in cur.fetchall():
    print(" ", r)

# Quantos IDs distintos do live_questions foram mapeados para o mesmo ssot_id?
cur.execute("""
    SELECT m.ssot_id, count(m.original_id) as dup_count
    FROM ssot_id_mapping m
    WHERE m.original_id IN (
        SELECT id FROM supabase_live_questions 
        WHERE modalidade LIKE '%revalida%' OR supabase_table LIKE '%revalida%'
    )
    GROUP BY m.ssot_id
    HAVING count(m.original_id) > 1
    ORDER BY dup_count DESC
    LIMIT 10
""")
print("\nExemplo de duplicações agrupadas no mesmo SSOT ID:")
for r in cur.fetchall():
    print(" ", r)

conn.close()
