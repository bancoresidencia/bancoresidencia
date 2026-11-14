import sqlite3, json

# 1. Carrega todas as pendentes do ranking_pendencias_atualizado.json ou faz query
# Vamos ver quantas questões em questoes_132k.db têm correct_answer preenchido
conn = sqlite3.connect('data/questoes_132k.db')
cursor = conn.cursor()

total = cursor.execute("SELECT count(*) FROM questions").fetchone()[0]
with_ans = cursor.execute("SELECT count(*) FROM questions WHERE correct_answer IS NOT NULL AND trim(correct_answer) != ''").fetchone()[0]
without_ans = total - with_ans

print(f"Total em questoes_132k.db: {total}")
print(f"Com gabarito: {with_ans} ({(with_ans/total)*100:.2f}%)")
print(f"Sem gabarito: {without_ans}")

# Verifica amostra de HMMSJP, FUBOG, USCS, etc.
for inst_prefix in ['HMMSJP%', '%FUBOG%', '%Caetano%', '%Macaé%', '%Nova Esperança%']:
    c_total = cursor.execute("SELECT count(*) FROM questions WHERE (institution LIKE ? OR code LIKE ?)", (inst_prefix, inst_prefix)).fetchone()[0]
    c_with = cursor.execute("SELECT count(*) FROM questions WHERE (institution LIKE ? OR code LIKE ?) AND correct_answer IS NOT NULL AND trim(correct_answer) != ''", (inst_prefix, inst_prefix)).fetchone()[0]
    print(f"Inst {inst_prefix}: Total={c_total}, Com Gabarito={c_with}, Sem Gabarito={c_total - c_with}")

conn.close()
