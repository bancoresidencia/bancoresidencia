import os
import sys
import json
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

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

# 1. Carrega todas as correspondências do drive_matches
print("Carregando matches da tabela drive_matches...")
drive_map = {}
for qid, esp, gab, pdf_name in c.execute("SELECT questao_banco_id, especialidade, gabarito, pdf_name FROM drive_matches"):
    drive_map[qid] = {'gabarito': gab, 'pdf_name': pdf_name, 'especialidade': esp}

print(f"Total de gabaritos mapeados no drive_matches: {len(drive_map):,}")

# 2. Atualiza cada especialidade
total_applied = 0
applied_by_esp = {k: 0 for k in QUESTION_FILES}

for esp, fpath in QUESTION_FILES.items():
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    esp_applied = 0
    for q in questions:
        qid = q.get('id')
        if not qid or qid not in drive_map:
            continue

        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))

        # Apenas atualiza se estiver vazio
        if not ans and not is_anulada:
            match_info = drive_map[qid]
            gab = match_info['gabarito']
            if gab == '!':
                q['isAnulada'] = True
                q['is_anulada'] = True
                q['correctAnswer'] = 'ANULADA'
                q['correct_answer'] = 'ANULADA'
            else:
                q['correctAnswer'] = gab
                q['correct_answer'] = gab
                q['isAnulada'] = False
                q['is_anulada'] = False

            q['official_source'] = f"Drive Projeto Rápido PDF: {match_info['pdf_name']}"
            esp_applied += 1
            total_applied += 1

    applied_by_esp[esp] = esp_applied
    print(f"   • {esp.replace('_', ' ').title():<25}: +{esp_applied:,} gabaritos aplicados")

    # Salva o arquivo atualizado
    if esp_applied > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

print("\n" + "="*70)
print(f"🎉 SINCRONIZAÇÃO CONCLUÍDA: +{total_applied:,} GABARITOS APLICADOS NO SEU BANCO!")
print("="*70)
