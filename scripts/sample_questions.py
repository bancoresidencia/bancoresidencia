import json, glob, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

sample_insts = [
    'SES-PE - Secretaria de Estado de Saúde de Pernambuco',
    'SUS-SP - Sistema Único de Saúde de São Paulo',
    'USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)'
]

with open('data/clinica_medica_final_questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for inst in sample_insts:
    print(f"\n=== AMOSTRA: {inst} ===")
    count = 0
    for q in data:
        if q.get('institution') == inst:
            print({
                'id': q.get('id'),
                'year': q.get('year'),
                'exam_name': q.get('exam_name'),
                'number': q.get('number'),
                'correct_answer': q.get('correct_answer'),
                'is_annulled': q.get('is_annulled'),
                'text_snippet': (q.get('text') or '')[:80] + '...'
            })
            count += 1
            if count >= 3:
                break
