import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/checkpoints/ginecologia_gold_anchors_complete.json', 'r', encoding='utf-8') as f:
    anchors = json.load(f)
anchor_by_id = {item['id']: item for item in anchors if 'id' in item}

with open('data/ginecologia_final_questions.json', 'r', encoding='utf-8') as f:
    gineco = json.load(f)

targets = [
  'UFRGS', 'HCPA', 'IAMSPE', 'AMP', 'HUCFF', 'UFRJ',
  'AMRIGS', 'Einstein', 'SES-GO', 'PSU-MG', 'SES-DF', 'BOS'
]

applied = 0
for q in gineco:
    inst = (q.get('institution') or q.get('banca') or '')
    ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
    if any(t.lower() in inst.lower() for t in targets):
        if not ans:
            if q.get('id') in anchor_by_id and anchor_by_id[q.get('id')].get('official_answer'):
                gabarito = anchor_by_id[q.get('id')]['official_answer']
                q['correct_answer'] = gabarito
                q['correctAnswer'] = gabarito
                if gabarito in ['X', 'ANULADA']:
                    q['is_anulada'] = True
                    q['isAnulada'] = True
                applied += 1

print(f"Gabaritos aplicados com sucesso no ginecologia_final_questions.json: {applied}")

with open('data/ginecologia_final_questions.json', 'w', encoding='utf-8') as f:
    json.dump(gineco, f, ensure_ascii=False, indent=2)

print("Arquivo data/ginecologia_final_questions.json atualizado e salvo.")
