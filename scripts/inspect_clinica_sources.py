import json
import sqlite3

with open('data/clinica_medica_final_questions.json', encoding='utf-8') as f:
    json_qs = json.load(f)
print(f"Questions in data/clinica_medica_final_questions.json: {len(json_qs)}")

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM questions_curated_staging WHERE especialidade = 'Clínica Médica'")
print(f"Questions in SQLite staging for Clínica Médica: {c.fetchone()[0]}")

c.execute("SELECT commentary_tier, count(*) FROM questions_curated_staging WHERE especialidade = 'Clínica Médica' GROUP BY commentary_tier")
print(f"SQLite staging breakdown: {c.fetchall()}")

# Check how many in json have padrao ouro vs need comm
valid_answers = {'A', 'B', 'C', 'D', 'E'}
needs_gold = 0
already_gold = 0
no_gabarito = 0
for q in json_qs:
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    comm = q.get('commentary') or ''
    if ans not in valid_answers:
        no_gabarito += 1
    elif 'Take-Home' in comm or 'Principal Motivo' in comm:
        already_gold += 1
    else:
        needs_gold += 1

print(f"In JSON file: already_gold={already_gold}, needs_gold={needs_gold}, no_gabarito={no_gabarito}")
