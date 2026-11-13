import sqlite3
import sys

db_path = "data/supabase_tables/supabase_tables.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("--- INICIANDO PADRONIZAÇÃO DE MODALIDADES (ETAPA 1) ---")

cur.execute("SELECT count(*) FROM questions_curated_staging")
total_before = cur.fetchone()[0]
print(f"Total de questões antes: {total_before}")
assert total_before == 254192, f"Total incorreto: {total_before}"

# Iniciar transação explícita
conn.execute("BEGIN TRANSACTION")

try:
    # 1. Reclassificar UEPA Revalida que estava em Acesso Direto -> Revalida (11 questões)
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'Revalida'
        WHERE LOWER(institution) LIKE '%uepa revalida%'
    """)
    uepa_count = cur.rowcount
    print(f"1. UEPA Revalida reclassificadas: {uepa_count}")

    # 2. Reclassificar '2019 - REVALIDA' -> Revalida (50 questões)
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'Revalida'
        WHERE modalidade = '2019 - REVALIDA'
    """)
    rev_2019_count = cur.rowcount
    print(f"2. '2019 - REVALIDA' reclassificadas: {rev_2019_count}")

    # 3. Reclassificar as 4 questões de R3 Neonatologia que estavam como 'Residência Médica' -> R+
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'R+'
        WHERE modalidade = 'Residência Médica'
          AND titulo_caderno LIKE '%- R3 -%'
    """)
    r3_hcg_count = cur.rowcount
    print(f"3. Questões R3 Neonatologia reclassificadas para R+: {r3_hcg_count}")

    # 4. Reclassificar todas as strings 'YYYY - R3 - ...' de provaderesidencia -> R+
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'R+'
        WHERE modalidade LIKE '%- R3 -%'
    """)
    r3_pdr_count = cur.rowcount
    print(f"4. Strings 'YYYY - R3 - ...' reclassificadas para R+: {r3_pdr_count}")

    # 5. Reclassificar strings 'YYYY - R1 - ...' de provaderesidencia -> Acesso Direto
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'Acesso Direto'
        WHERE modalidade LIKE '%- R1 -%'
    """)
    r1_pdr_count = cur.rowcount
    print(f"5. Strings 'YYYY - R1 - ...' reclassificadas para Acesso Direto: {r1_pdr_count}")

    # 6. Unificar 'Residência Médica' e 'Residência Médica (Acesso Direto)' -> Acesso Direto
    cur.execute("""
        UPDATE questions_curated_staging
        SET modalidade = 'Acesso Direto'
        WHERE modalidade IN ('Residência Médica', 'Residência Médica (Acesso Direto)')
    """)
    direto_count = cur.rowcount
    print(f"6. 'Residência Médica' e 'Residência Médica (Acesso Direto)' unificadas para Acesso Direto: {direto_count}")

    # Confirmar commit
    conn.commit()
    print("Transação confirmada com sucesso (COMMIT)!")

except Exception as e:
    conn.rollback()
    print(f"Erro fatal, ROLLBACK executado: {e}")
    sys.exit(1)

# Validação Pós-Execução
print("\n--- VALIDAÇÃO DOS RESULTADOS NA BASE ---")
cur.execute("SELECT modalidade, COUNT(*) FROM questions_curated_staging GROUP BY modalidade ORDER BY COUNT(*) DESC")
results = cur.fetchall()

total_after = 0
for mod, cnt in results:
    total_after += cnt
    pct = round(cnt / 254192 * 100, 2)
    print(f"  Modalidade: '{mod}' -> {cnt:,} questões ({pct}%)")

assert total_after == 254192, f"Total pós-update diverge: {total_after}"
assert len(results) == 4, f"Deveria haver exatamente 4 categorias, mas foram encontradas: {len(results)}"
expected_mods = {'Acesso Direto', 'R+', 'Revalida', 'Título de Especialista'}
actual_mods = set(r[0] for r in results)
assert actual_mods == expected_mods, f"Categorias divergentes do esperado: {actual_mods} vs {expected_mods}"

print("\nTODOS OS QUALITY GATES APROVADOS COM 100% DE ACURÁCIA!")
conn.close()
