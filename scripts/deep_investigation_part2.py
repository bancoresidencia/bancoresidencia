import sqlite3
import json
import re
from collections import Counter

db_path = 'data/supabase_tables/supabase_tables.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("--- 1. Investigando as 1.615 questões Múltipla Escolha com options vazias ---")
cur.execute("""
    SELECT id, code, banca, institution, year, statement, correct_answer, source_tables
    FROM questions_curated_staging
    WHERE type = 'Múltipla escolha' AND (options IS NULL OR options IN ('', 'null', '[]', '{}'))
    LIMIT 5
""")
empty_opts = cur.fetchall()
for r in empty_opts:
    print(f"ID: {r[0]}, Code: {r[1]}, Banca: {r[2]}, Inst: {r[3]}, Year: {r[4]}, Gab: {r[6]}, Src: {r[7]}")
    print(f"Statement snippet: {repr(r[5][:150])}")
    print("-" * 50)

print("\n--- 2. Verificando se statement das empty_opts tem alternativas embutidas ---")
cur.execute("""
    SELECT count(*)
    FROM questions_curated_staging
    WHERE type = 'Múltipla escolha' AND (options IS NULL OR options IN ('', 'null', '[]', '{}'))
      AND (statement LIKE '%A)%B)%C)%' OR statement LIKE '%[A]%[B]%[C]%' OR statement LIKE '%A - %B - %C - %' OR statement LIKE '%a)%b)%c)%')
""")
embedded_in_stmt = cur.fetchone()[0]
print(f"Questões com alternativas embutidas no statement: {embedded_in_stmt} de 1.615")

print("\n--- 3. Investigando as 5.463 questões com 2 alternativas ---")
cur.execute("""
    SELECT banca, count(*) 
    FROM questions_curated_staging 
    WHERE json_array_length(options) = 2
    GROUP BY banca
    ORDER BY count(*) DESC
    LIMIT 10
""")
bancas_2_opts = cur.fetchall()
for b, cnt in bancas_2_opts:
    print(f"  {repr(b)}: {cnt}")

cur.execute("""
    SELECT options 
    FROM questions_curated_staging 
    WHERE json_array_length(options) = 2
    LIMIT 3
""")
samples_2_opts = cur.fetchall()
for s in samples_2_opts:
    print("  Exemplo 2 opts:", s[0][:150])

print("\n--- 4. Investigando as 1.244 questões com 1 alternativa ---")
cur.execute("""
    SELECT banca, source_tables, count(*) 
    FROM questions_curated_staging 
    WHERE json_array_length(options) = 1
    GROUP BY banca, source_tables
    ORDER BY count(*) DESC
    LIMIT 5
""")
for r in cur.fetchall():
    print(f"  Banca: {r[0]}, Src: {r[1]} -> {r[2]}")

cur.execute("""
    SELECT id, code, statement, options, correct_answer 
    FROM questions_curated_staging 
    WHERE json_array_length(options) = 1
    LIMIT 2
""")
for r in cur.fetchall():
    print(f"  ID: {r[0]}, Code: {r[1]}, Gab: {r[4]}")
    print(f"  Options: {r[3]}")
    print(f"  Statement: {r[2][:120]}")

print("\n--- 5. Investigando as 168 anomalias de correct_answer (!, 38, etc.) ---")
cur.execute("""
    SELECT correct_answer, count(*), source_tables
    FROM questions_curated_staging
    WHERE correct_answer NOT IN ('A','B','C','D','E','ANULADA') AND correct_answer IS NOT NULL AND correct_answer != ''
    GROUP BY correct_answer, source_tables
""")
for r in cur.fetchall():
    print(f"  Gab: {repr(r[0])}, Count: {r[1]}, Src: {r[2]}")

print("\n--- 6. Verificando correspondência de índice para as 33.746 questões sem letter ---")
# Vamos checar se o campo 'index' ou a posição no array bate com o gabarito
cur.execute("""
    SELECT id, code, options, correct_answer
    FROM questions_curated_staging
    WHERE options LIKE '%\"index\":%' AND options NOT LIKE '%\"letter\":%' AND correct_answer IN ('A','B','C','D','E')
    LIMIT 5
""")
samples_idx = cur.fetchall()
letters = ['A', 'B', 'C', 'D', 'E']
for r in samples_idx:
    qid, code, opts_json, ans = r
    opts = json.loads(opts_json)
    print(f"ID: {qid}, Code: {code}, Gabarito Oficial: {ans}")
    for i, opt in enumerate(opts):
        idx = opt.get('index', i)
        inferred_letter = letters[i] if i < len(letters) else '?'
        is_the_answer = (inferred_letter == ans)
        marker = " <--- GABARITO" if is_the_answer else ""
        print(f"   Pos {i} (index={idx}) -> Letra Inferida {inferred_letter}: {opt.get('text', '')[:60]}...{marker}")
    print("-" * 50)
