import json, glob, os

print("--- 1. questoes_ineditas_livros_drive_7822.json ---")
with open('data/questoes_ineditas_livros_drive_7822.json', 'r', encoding='utf-8') as f:
    ineditas = json.load(f)
    print(f"Total: {len(ineditas)}")
    with_ans = sum(1 for q in ineditas if q.get('official_answer'))
    print(f"Com official_answer: {with_ans}")
    if ineditas:
        print("Sample:", {k: str(ineditas[0].get(k))[:80] for k in ineditas[0]})

print("\n--- 2. ginecologia_legacy_extracted.json ---")
with open('data/archive/ginecologia_legacy_extracted.json', 'r', encoding='utf-8') as f:
    gin = json.load(f)
    questions = gin.get('questions', [])
    print(f"Total: {len(questions)}")
    with_ans = sum(1 for q in questions if q.get('correct_answer') or q.get('official_answer') or q.get('gabarito'))
    print(f"Com gabarito: {with_ans}")
    if questions:
        print("Sample keys:", list(questions[0].keys()))
        print("Sample correct_answer:", questions[0].get('correct_answer'))

print("\n--- 3. urologia_legacy_extracted.json ---")
with open('data/archive/urologia_legacy_extracted.json', 'r', encoding='utf-8') as f:
    uro = json.load(f)
    questions = uro.get('questions', [])
    print(f"Total: {len(questions)}")
    with_ans = sum(1 for q in questions if q.get('correct_answer') or q.get('official_answer') or q.get('gabarito'))
    print(f"Com gabarito: {with_ans}")

print("\n--- 4. abem_gabaritos_2024_2025_2026.json ---")
with open('data/abem_gabaritos_2024_2025_2026.json', 'r', encoding='utf-8') as f:
    abem = json.load(f)
    print("Keys:", list(abem.keys()))
    for k in abem:
        print(f"  {k}: {len(abem[k]) if isinstance(abem[k], list) else type(abem[k])}")

print("\n--- 5. gabarito_das_questoes sample ---")
gq_files = glob.glob('data/knowledge/gabarito_das_questoes/**/*.json', recursive=True)
total_gq_q = 0
for gf in gq_files[:5]:
    with open(gf, 'r', encoding='utf-8') as f:
        d = json.load(f)
        qlist = d.get('questionsAudit', []) or d.get('questionsFoundInBook', [])
        print(f"  {os.path.basename(gf)}: audit={len(d.get('questionsAudit', []))}, found={len(d.get('questionsFoundInBook', []))}")
