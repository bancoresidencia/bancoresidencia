import json
import sqlite3
import os
from collections import Counter

QUESTION_FILES = {
    'cirurgia': 'data/cirurgia_final_questions.json',
    'clinica_medica': 'data/clinica_medica_final_questions.json',
    'ginecologia': 'data/ginecologia_final_questions.json',
    'obstetricia': 'data/obstetricia_final_questions.json',
    'pediatria': 'data/pediatria_final_questions.json',
    'medicina_preventiva': 'data/medicina_preventiva_final_questions.json',
    'urologia': 'data/urologia_final_questions.json'
}

print("=== 1. BANCO LOCAL CANONICO (7 Especialidades) ===")
total_local = 0
local_ids = set()
for esp, path in QUESTION_FILES.items():
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    print(f"  {esp:<22}: {len(data):>7,} questões")
    total_local += len(data)
    for q in data:
        qid = q.get('id')
        if qid:
            local_ids.add(str(qid))

print(f"Total de questoes no banco local: {total_local:,} (IDs unicos: {len(local_ids):,})")

print("\n=== 2. BANCO SQLITE QUESTMED (questmed_extracted_exams.db) ===")
conn = sqlite3.connect('data/questmed_extracted_exams.db')
c = conn.cursor()

c.execute('SELECT COUNT(*) FROM questmed_questions')
total_qm = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM questmed_questions WHERE staged_for_expansion = 1')
staged_expansion = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM questmed_questions WHERE staged_for_expansion = 0')
matched_bank = c.fetchone()[0]

print(f"Total de questões extraídas do QuestMed: {total_qm:,}")
print(f"  - Casadas com questões existentes no nosso banco: {matched_bank:,}")
print(f"  - Novas questões (staged para expansão): {staged_expansion:,}")

# Verificar quantos IDs do staged coincidem com local_ids por acaso
c.execute('SELECT id, enunciado_hash FROM questmed_questions WHERE staged_for_expansion = 1')
staged_rows = c.fetchall()
staged_ids = set(str(r[0]) for r in staged_rows)
overlap_ids = staged_ids.intersection(local_ids)
print(f"  - Sobreposição de IDs com banco local: {len(overlap_ids)}")

print("\n=== 3. CENÁRIOS DE TOTALIZAÇÃO ===")
print(f"Cenário A - Banco Local Atual: {total_local:,} questões")
print(f"Cenário B - Se adicionarmos as novas questões do QuestMed (staged):")
print(f"  {total_local:,} + {staged_expansion:,} = {total_local + staged_expansion:,} questões")

conn.close()
