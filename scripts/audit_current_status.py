import sqlite3
import json

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cursor = conn.cursor()

query = """
SELECT 
    COALESCE(especialidade, 'NÃO DEFINIDA') as esp,
    COUNT(*) as total,
    SUM(CASE WHEN commentary_tier = 'padrao_ouro' THEN 1 ELSE 0 END) as ouro,
    SUM(CASE WHEN commentary_tier = 'comentada' THEN 1 ELSE 0 END) as comentada,
    SUM(CASE WHEN commentary_tier = 'sem_comentario' OR commentary_tier IS NULL THEN 1 ELSE 0 END) as sem_comentario
FROM questions_curated_staging
GROUP BY especialidade
ORDER BY total DESC
"""

rows = cursor.execute(query).fetchall()

header = f"{'Especialidade':30} | {'Total':8} | {'Padrao Ouro':12} | {'% Ouro':7} | {'Comentada':10} | {'Sem Comentario':14}"
sep = "-" * len(header)
print("\n" + sep)
print(header)
print(sep)

tot_all = tot_ouro = tot_com = tot_sem = 0
for esp, total, ouro, comentada, sem_comentario in rows:
    pct = (ouro / total * 100) if total else 0
    print(f"{esp:30} | {total:8d} | {ouro:12d} | {pct:6.1f}% | {comentada:10d} | {sem_comentario:14d}")
    tot_all += total
    tot_ouro += ouro
    tot_com += comentada
    tot_sem += sem_comentario

print(sep)
pct_tot = (tot_ouro / tot_all * 100) if tot_all else 0
print(f"{'TOTAL GERAL':30} | {tot_all:8d} | {tot_ouro:12d} | {pct_tot:6.1f}% | {tot_com:10d} | {tot_sem:14d}")
print(sep)
