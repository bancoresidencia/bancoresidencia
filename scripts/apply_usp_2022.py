import json, glob, re, sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Carregar mapeamentos
with open('data/official_exams/USP_FUVEST/usp_2022_matches.json', 'r', encoding='utf-8') as f:
    match_data = json.load(f)

matched = match_data['matched']
match_by_id = {m['id']: m for m in matched}
print(f"Carregados {len(match_by_id)} mapeamentos.")

files = [f for f in glob.glob('data/*_final_questions.json') if 'all_homologated' not in f]
total_updated = 0

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    file_updated = 0
    for q in questions:
        qid = q.get('id')
        if qid in match_by_id:
            m = match_by_id[qid]
            q_num = m['q_num']
            gabarito = m['official_gabarito']
            
            # Atualiza correct_answer se vazio ou discrepante
            q['correct_answer'] = gabarito
            q['correctAnswer'] = gabarito
            q['question_number'] = q_num
            q['is_official'] = True
            
            # Auditoria oficial
            q['official_audit'] = {
                'verified': True,
                'source': 'USP_2022_GB.pdf',
                'banca': 'COREME/FMUSP (Tekyou Soluções)',
                'edital': 'Processo Seletivo Residência Médica FMUSP 2022 (Acesso Direto e Áreas Básicas)',
                'exam_date': '27/11/2021',
                'prova_source': 'FMUSP22-Acesso_Direto-prova.pdf',
                'question_number': q_num,
                'official_gabarito': gabarito,
                'verified_at': datetime.now().isoformat()
            }
            
            file_updated += 1
            total_updated += 1
            
    if file_updated > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        print(f"{fpath}: {file_updated} questões homologadas com sucesso.")

print(f"\nTOTAL GERAL HOMOLOGADO USP-SP 2022: {total_updated} questões!")
