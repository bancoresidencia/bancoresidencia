import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

# List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("Tabelas encontradas:", tables)

for table in tables:
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cur.fetchall()]
    print(f"\nColunas da tabela '{table}':\n", cols)
    
    # Checar estatísticas de preenchimento das colunas de recategorização
cur.execute("SELECT COUNT(*) FROM questions")
total = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE novo_tema IS NOT NULL AND novo_tema != ''")
total_novo_tema = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE novo_foco IS NOT NULL AND novo_foco != ''")
total_novo_foco = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE novo_subfoco IS NOT NULL AND novo_subfoco != ''")
total_novo_subfoco = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE novo_sub_subfoco IS NOT NULL AND novo_sub_subfoco != '' AND novo_sub_subfoco != 'None'")
total_novo_sub_subfoco = cur.fetchone()[0]

print(f"\n--- CENSO DE RECATEGORIZAÇÃO DAS QUESTÕES (Total: {total}) ---")
print(f"novo_tema preenchido: {total_novo_tema} ({total_novo_tema/total*100:.1f}%)")
print(f"novo_foco preenchido: {total_novo_foco} ({total_novo_foco/total*100:.1f}%)")
print(f"novo_subfoco preenchido: {total_novo_subfoco} ({total_novo_subfoco/total*100:.1f}%)")
print(f"novo_sub_subfoco preenchido: {total_novo_sub_subfoco} ({total_novo_sub_subfoco/total*100:.1f}%)")

# Amostras por especialidade
cur.execute("SELECT especialidade, COUNT(*), SUM(CASE WHEN novo_sub_subfoco IS NOT NULL AND novo_sub_subfoco != '' AND novo_sub_subfoco != 'None' THEN 1 ELSE 0 END) FROM questions GROUP BY especialidade")
print("\nPor Especialidade (Total vs Com novo_sub_subfoco):")
for r in cur.fetchall():
    print(f"  - {r[0]}: Total {r[1]} | Com sub_subfoco: {r[2]}")

# Amostra de algumas linhas de novo_sub_subfoco
cur.execute("SELECT especialidade, novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco FROM questions WHERE novo_sub_subfoco IS NOT NULL AND novo_sub_subfoco != '' AND novo_sub_subfoco != 'None' LIMIT 5")
print("\nAmostras de novo_sub_subfoco gravados:")
for r in cur.fetchall():
    print("  *", r)

