import os
import sys
import json
import time
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

DATA_DIR = r'D:\bancoresidencia\data'
QUESTION_FILES = {
    'urologia': os.path.join(DATA_DIR, 'urologia_final_questions.json'),
    'ginecologia': os.path.join(DATA_DIR, 'ginecologia_final_questions.json'),
    'obstetricia': os.path.join(DATA_DIR, 'obstetricia_final_questions.json'),
    'cirurgia': os.path.join(DATA_DIR, 'cirurgia_final_questions.json'),
    'pediatria': os.path.join(DATA_DIR, 'pediatria_final_questions.json'),
    'medicina_preventiva': os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json'),
    'clinica_medica': os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
}

conn = sqlite3.connect('data/provaderesidencia_coleta.db')
c = conn.cursor()

print("="*70)
print("SINCRONIZANDO TODOS OS MATCHES DE GABARITOS DO SQLITE PARA O BANCO")
print("="*70)

# 1. Carrega todas as correspondências oficiais do SQLite
# Tabelas: matches_banco e drive_matches
all_matches = {}

# De drive_matches (37,952)
for qid, esp, gab, pdf_name in c.execute("SELECT questao_banco_id, especialidade, gabarito, pdf_name FROM drive_matches"):
    all_matches[qid] = {'gab': gab, 'source': f"Drive PDF {pdf_name}"}

# De matches_banco (33,465)
for qid, esp, gab, inst, ano in c.execute("SELECT questao_banco_id, especialidade, gabarito, instituicao, ano FROM matches_banco"):
    if qid not in all_matches:
        all_matches[qid] = {'gab': gab, 'source': f"Provaderesidencia {inst} {ano}"}

print(f"Total de gabaritos oficiais mapeados no SQLite: {len(all_matches):,}")

# 2. Aplica em cada especialidade
total_applied = 0

for esp, fpath in QUESTION_FILES.items():
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    esp_applied = 0
    for q in questions:
        qid = q.get('id')
        if not qid or qid not in all_matches:
            continue

        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))

        # Apenas preenche se estiver sem resposta
        if not ans and not is_anulada:
            m = all_matches[qid]
            gab = m['gab'].upper()
            if gab in ['!', 'X', 'ANULADA', '*', '#']:
                q['isAnulada'] = True
                q['is_anulada'] = True
                q['correctAnswer'] = 'ANULADA'
                q['correct_answer'] = 'ANULADA'
            else:
                q['correctAnswer'] = gab
                q['correct_answer'] = gab
                q['isAnulada'] = False
                q['is_anulada'] = False

            q['official_source'] = m['source']
            esp_applied += 1
            total_applied += 1

    print(f"   • {esp.replace('_', ' ').title():<25}: +{esp_applied:,} gabaritos aplicados")

    # Salva diretamente com retry loop seguro
    if esp_applied > 0:
        saved = False
        for attempt in range(1, 4):
            try:
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(questions, f, ensure_ascii=False, indent=2)
                saved = True
                break
            except Exception as e:
                time.sleep(1)
        if not saved:
            print(f"   ❌ ERRO AO SALVAR {esp}!")

print("="*70)
print(f"🎉 SINCRONIZAÇÃO COMPLETA: +{total_applied:,} GABARITOS INJETADOS NO BANCO!")
print("="*70)
