import glob
import json

def inspect_sc(year):
    print(f"=== SANTA CASA SP {year} ===")
    questions = []
    for fpath in glob.glob('data/*_final_questions.json'):
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for q in data:
            inst = str(q.get('institution', '')).upper()
            if ('SANTA CASA' in inst or 'ISCMSP' in inst) and q.get('year') == year:
                questions.append((fpath, q))
    
    total = len(questions)
    homologated = sum(1 for _, q in questions if q.get('official_audit'))
    unsolved = [q for _, q in questions if not q.get('official_audit')]
    print(f"Total: {total} | Homologados: {homologated} | Faltam: {len(unsolved)}")
    for i, q in enumerate(unsolved[:8]):
        stmt = " ".join((q.get('statement') or q.get('text') or '').split())[:80]
        print(f"  [{i+1}] ID: {q['id']} | Spec: {q.get('especialidade')} | Banca: {q.get('banca')}")
        print(f"       Stmt: {stmt}")

inspect_sc(2024)
inspect_sc(2025)
