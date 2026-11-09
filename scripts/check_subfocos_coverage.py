import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

# 1. Checar IAMCSST exato
cur.execute("""
    SELECT COUNT(*) FROM questions 
    WHERE (subfoco LIKE '%IAM%Supra%' OR novo_subfoco LIKE '%IAM%Supra%' OR subfoco LIKE '%IAMCSST%' OR novo_subfoco LIKE '%IAMCSST%')
""")
total_iamcsst = cur.fetchone()[0]

cur.execute("""
    SELECT subfoco, novo_subfoco, COUNT(*) 
    FROM questions 
    WHERE (subfoco LIKE '%IAM%Supra%' OR novo_subfoco LIKE '%IAM%Supra%' OR subfoco LIKE '%IAMCSST%' OR novo_subfoco LIKE '%IAMCSST%')
    GROUP BY subfoco, novo_subfoco
""")
iam_details = cur.fetchall()

# 2. Checar cobertura global de subfocos (132k)
cur.execute("SELECT COUNT(*) FROM questions")
total_global = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE subfoco IS NOT NULL AND subfoco != '' AND subfoco != 'None'")
total_com_subfoco_legado = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM questions WHERE novo_subfoco IS NOT NULL AND novo_subfoco != '' AND novo_subfoco != 'None'")
total_com_novo_subfoco = cur.fetchone()[0]

# 3. Checar Cardiologia especificamente
cur.execute("""
    SELECT COUNT(*) FROM questions 
    WHERE especialidade = 'Clínica Médica' AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
""")
total_cardio = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM questions 
    WHERE especialidade = 'Clínica Médica' AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
      AND (novo_subfoco IS NOT NULL AND novo_subfoco != '' AND novo_subfoco != 'None')
""")
cardio_com_novo_subfoco = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM questions 
    WHERE especialidade = 'Clínica Médica' AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
      AND (novo_subfoco IS NULL OR novo_subfoco = '' OR novo_subfoco = 'None')
""")
cardio_sem_subfoco = cur.fetchone()[0]

print("=== 1. CONTAGEM EXATA DE IAMCSST ===")
print(f"Total de questões identificadas para IAMCSST no banco: {total_iamcsst}")
for r in iam_details:
    print(f"  * subfoco='{r[0]}' | novo_subfoco='{r[1]}' -> {r[2]} questões")

print("\n=== 2. COBERTURA GLOBAL DE SUBFOCOS (TOTAL: {total_global}) ===")
print(f"Com subfoco legado: {total_com_subfoco_legado} ({total_com_subfoco_legado/total_global*100:.2f}%)")
print(f"Sem subfoco legado: {total_global - total_com_subfoco_legado} ({(total_global - total_com_subfoco_legado)/total_global*100:.2f}%)")
print(f"Com novo_subfoco:   {total_com_novo_subfoco} ({total_com_novo_subfoco/total_global*100:.2f}%)")
print(f"Sem novo_subfoco:   {total_global - total_com_novo_subfoco} ({(total_global - total_com_novo_subfoco)/total_global*100:.2f}%)")

# 4. Checar no hierarchyCounts.ts
import re
with open('src/data/hierarchyCounts.ts', 'r', encoding='utf-8') as f:
    counts_content = f.read()

m = re.findall(r'"([^"]*IAMCSST[^"]*)":\s*(\d+)', counts_content)
print("\n=== 4. NO hierarchyCounts.ts (O QUE O FRONT-END MOSTRA) ===")
for k, v in m:
    print(f"  * {k}: {v}")

