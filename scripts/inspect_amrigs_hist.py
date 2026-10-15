import glob
import json

def inspect_year(target_year):
    print(f"=== AMRIGS {target_year} ===")
    questions = []
    for fpath in glob.glob('data/*_final_questions.json'):
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for q in data:
            if 'AMRIGS' in str(q.get('institution', '')).upper() and q.get('year') == target_year:
                questions.append((fpath, q))
    
    print(f"Total questions: {len(questions)}")
    for i, (fpath, q) in enumerate(questions[:10]):
        stmt = " ".join((q.get('statement') or q.get('text') or '').split())[:90]
        audit = q.get('official_audit')
        ans = q.get('correct_answer') or q.get('correctAnswer')
        print(f"[{i+1}] ID: {q['id']} | Spec: {q.get('especialidade')} | Ans: {ans} | Audit: {bool(audit)}")
        print(f"     Stmt: {stmt}")

inspect_year(2017)
inspect_year(2015)
