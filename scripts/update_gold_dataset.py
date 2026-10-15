import glob
import json
import os

print("--- Consolidando Dataset Gold de Questões Homologadas ---")
files = glob.glob('data/*_final_questions.json')
gold_questions = []
seen_codes = set()

for fpath in files:
    if 'all_homologated_questions_gold.json' in fpath:
        continue
    with open(fpath, 'r', encoding='utf-8') as fp:
        questions = json.load(fp)
    
    for q in questions:
        code = q.get('code')
        ca = q.get('correct_answer') or q.get('correctAnswer')
        oa = q.get('official_audit')
        
        # Considera questão homologada se possui auditoria oficial verificada
        if oa and oa.get('verified') and code and code not in seen_codes:
            seen_codes.add(code)
            gold_questions.append(q)

gold_path = 'data/all_homologated_questions_gold.json'
with open(gold_path, 'w', encoding='utf-8') as fp:
    json.dump(gold_questions, fp, ensure_ascii=False, indent=2)

print(f"Dataset Gold consolidado com sucesso!")
print(f"Total de questões homologadas: {len(gold_questions)}")
