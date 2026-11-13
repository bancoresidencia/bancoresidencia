import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

# 1. Contagem com modalidade = 'Revalida'
cur.execute("SELECT count(*) FROM questions_curated_staging WHERE modalidade = 'Revalida'")
c_modalidade = cur.fetchone()[0]

# 2. Contagem na tabela original de importação questions_expansion_revalida
cur.execute("SELECT count(*) FROM questions_expansion_revalida")
c_exp_revalida = cur.fetchone()[0]

# 3. Menções de Revalida ou INEP no banco staging
cur.execute("""
    SELECT count(*) FROM questions_curated_staging 
    WHERE lower(institution) LIKE '%revalida%' 
       OR lower(banca) LIKE '%revalida%' 
       OR lower(tipo_prova) LIKE '%revalida%'
       OR lower(titulo_caderno) LIKE '%revalida%'
       OR lower(institution) LIKE '%inep%'
       OR lower(banca) LIKE '%inep%'
""")
c_mencoes = cur.fetchone()[0]

# 4. Questões que mencionam Revalida/INEP mas estão com outra modalidade
cur.execute("""
    SELECT modalidade, count(*) 
    FROM questions_curated_staging 
    WHERE (lower(institution) LIKE '%revalida%' 
       OR lower(banca) LIKE '%revalida%' 
       OR lower(tipo_prova) LIKE '%revalida%'
       OR lower(titulo_caderno) LIKE '%revalida%'
       OR lower(institution) LIKE '%inep%'
       OR lower(banca) LIKE '%inep%')
    GROUP BY modalidade
""")
rows_mencao_por_mod = cur.fetchall()

# 5. Detalhamento por instituição e ano das questões com modalidade = 'Revalida'
cur.execute("""
    SELECT institution, banca, year, count(*) 
    FROM questions_curated_staging 
    WHERE modalidade = 'Revalida'
    GROUP BY institution, banca, year
    ORDER BY count(*) DESC
""")
breakdown = cur.fetchall()

# 6. Detalhamento das questões que mencionam INEP
cur.execute("""
    SELECT modalidade, institution, banca, year, count(*)
    FROM questions_curated_staging
    WHERE (lower(institution) LIKE '%inep%' OR lower(banca) LIKE '%inep%')
    GROUP BY modalidade, institution, banca, year
""")
inep_rows = cur.fetchall()

print(f"Total com modalidade = 'Revalida' na SSOT: {c_modalidade}")
print(f"Total na tabela original questions_expansion_revalida: {c_exp_revalida}")
print(f"Total com mencao textual a Revalida ou INEP: {c_mencoes}")
print("\nDistribuicao de modalidade para mencoes a Revalida/INEP:")
for mod, cnt in rows_mencao_por_mod:
    print(f"  {mod}: {cnt}")

print("\nDetalhamento das questões de Revalida (Top 15 grupos):")
for inst, ban, yr, cnt in breakdown[:15]:
    print(f"  Inst: {inst} | Banca: {ban} | Ano: {yr} | Total: {cnt}")

print("\nQuestoes ligadas ao INEP:")
for mod, inst, ban, yr, cnt in inep_rows:
    print(f"  Mod: {mod} | Inst: {inst} | Banca: {ban} | Ano: {yr} | Total: {cnt}")

# 7. Verificar se há no statement algo muito explícito de "Revalida INEP" em outras modalidades
cur.execute("""
    SELECT count(*) FROM questions_curated_staging
    WHERE modalidade != 'Revalida'
      AND (statement LIKE '%Revalida INEP%' OR statement LIKE '%Exame Nacional de Revalidação%')
""")
c_stmt = cur.fetchone()[0]
print(f"\nMenções a Revalida INEP no statement fora de Revalida: {c_stmt}")

conn.close()
