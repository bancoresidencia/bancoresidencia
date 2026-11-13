import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

print("--- RASTREANDO OS 4.358 UUIDs DE REVALIDA DO SUPABASE_LIVE_QUESTIONS ---")

# 1. Quantos dos 4358 IDs estao em ssot_id_mapping?
cur.execute("""
    SELECT count(distinct m.clean_id), count(distinct m.ssot_id)
    FROM supabase_live_questions l
    JOIN ssot_id_mapping m ON l.id = m.clean_id
    WHERE l.supabase_table = 'questions_revalida'
""")
res_map = cur.fetchone()
print(f"IDs mapeados no ssot_id_mapping: clean_ids={res_map[0]}, ssot_ids={res_map[1]}")

# 2. Se os IDs de live_questions são UUIDs, onde eles aparecem em questions_curated_staging?
cur.execute("""
    SELECT s.modalidade, count(distinct s.id)
    FROM supabase_live_questions l
    JOIN ssot_id_mapping m ON l.id = m.clean_id
    JOIN questions_curated_staging s ON m.ssot_id = s.id
    WHERE l.supabase_table = 'questions_revalida'
    GROUP BY s.modalidade
""")
print("\nModalidade atual na SSOT (questions_curated_staging) via mapping:")
for mod, cnt in cur.fetchall():
    print(f"  {mod}: {cnt}")

# 3. E quantos NÃO estão mapeados pelo clean_id direto?
cur.execute("""
    SELECT count(*)
    FROM supabase_live_questions l
    WHERE l.supabase_table = 'questions_revalida'
      AND l.id NOT IN (SELECT clean_id FROM ssot_id_mapping)
""")
not_mapped = cur.fetchone()[0]
print(f"\nDos 4.358, quantos NÃO acharam match exato de clean_id: {not_mapped}")

# 4. Verificar se a tabela questions_expansion_revalida na verdade tinha apenas 1.437 questões
cur.execute("SELECT count(*) FROM questions_expansion_revalida")
q_exp = cur.fetchone()[0]
print(f"Total na tabela questions_expansion_revalida importada do Supabase: {q_exp}")

# 5. O que era a tabela questions_revalida que gerou 4.358 em supabase_live_questions?
# Vamos ver de onde supabase_live_questions foi preenchida
conn.close()
