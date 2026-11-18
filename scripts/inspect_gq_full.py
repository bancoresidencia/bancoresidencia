import json, glob

gq_files = glob.glob('data/knowledge/gabarito_das_questoes/**/*.json', recursive=True)
print(f"Total de arquivos: {len(gq_files)}")
total_questions = 0
total_with_ans = 0

sample_q = None
for gf in gq_files:
    try:
        with open(gf, 'r', encoding='utf-8') as f:
            d = json.load(f)
            qa = d.get('questionsAudit', [])
            if isinstance(qa, list):
                total_questions += len(qa)
                for q in qa:
                    if q.get('officialAnswer') or q.get('official_answer') or q.get('gabarito'):
                        total_with_ans += 1
                    if not sample_q and len(qa) > 0:
                        sample_q = qa[0]
    except:
        pass

print(f"Total de questões nos 337 arquivos: {total_questions}")
print(f"Total com gabarito: {total_with_ans}")
if sample_q:
    print("Sample question keys:", list(sample_q.keys()))
    print("Sample:", {k: str(sample_q.get(k))[:80] for k in sample_q})
