import sqlite3
import json

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

print("--- 1. Analisando as questões com 1 alternativa ---")
cur.execute("""
    SELECT count(*), 
           SUM(CASE WHEN options LIKE '%GABARITO%' THEN 1 ELSE 0 END),
           SUM(CASE WHEN commentary IS NOT NULL AND length(commentary) > 10 THEN 1 ELSE 0 END)
    FROM questions_curated_staging
    WHERE json_array_length(options) = 1
""")
r = cur.fetchone()
print(f"Total com 1 opção: {r[0]}, com palavra GABARITO na opção: {r[1]}, com comentário já preenchido: {r[2]}")

print("\n--- 2. Analisando as questões com 2 alternativas ---")
cur.execute("""
    SELECT count(*),
           SUM(CASE WHEN options LIKE '%Certo%' OR options LIKE '%CERTO%' THEN 1 ELSE 0 END),
           SUM(CASE WHEN options LIKE '%Errado%' OR options LIKE '%ERRADO%' THEN 1 ELSE 0 END)
    FROM questions_curated_staging
    WHERE json_array_length(options) = 2
""")
r = cur.fetchone()
print(f"Total com 2 opções: {r[0]}, contendo Certo: {r[1]}, contendo Errado: {r[2]}")

print("\n--- 3. Analisando as 156 questões com gabarito '!' ---")
cur.execute("""
    SELECT count(*),
           SUM(CASE WHEN options IS NULL OR options IN ('', '[]', 'null') THEN 1 ELSE 0 END)
    FROM questions_curated_staging
    WHERE correct_answer = '!'
""")
r = cur.fetchone()
print(f"Total com '!': {r[0]}, com options vazias: {r[1]}")

print("\n--- 4. Checksum inicial de especialidade, tema, foco, subfoco ---")
cur.execute("""
    SELECT count(*), 
           count(especialidade), 
           count(tema), 
           count(foco), 
           count(subfoco)
    FROM questions_curated_staging
""")
r = cur.fetchone()
print(f"Contagens taxonômicas: Total={r[0]}, Esp={r[1]}, Tema={r[2]}, Foco={r[3]}, Subfoco={r[4]}")
