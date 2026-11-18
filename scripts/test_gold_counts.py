import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
c = conn.cursor()

q = """
SELECT 
  especialidade,
  count(1) as total,
  count(case when commentary like '%Take-Home%' or commentary like '%Principal Motivo de Erro%' then 1 end) as ouro_like,
  count(case when commentary_tier = 'padrao_ouro' then 1 end) as ouro_tier
FROM questions_curated_staging
GROUP BY especialidade
ORDER BY total DESC
"""

rows = c.execute(q).fetchall()
print(f"{'Especialidade':30} | {'Total':8} | {'ouro_like':10} | {'ouro_tier':10}")
print("-" * 65)
tot_all = tot_like = tot_tier = 0
for esp, total, like, tier in rows:
    print(f"{esp:30} | {total:8d} | {like:10d} | {tier:10d}")
    tot_all += total
    tot_like += like
    tot_tier += tier
print("-" * 65)
print(f"{'TOTAL':30} | {tot_all:8d} | {tot_like:10d} | {tot_tier:10d}")
