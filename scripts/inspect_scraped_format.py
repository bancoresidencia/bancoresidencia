import glob
import json
import os

files_2026 = glob.glob('data/scraped_exams/raw/2026/*.json')
print(f'Total 2026 exam files: {len(files_2026)}')

for fpath in files_2026[:3]:
    print('='*50)
    print(f'Exam file: {os.path.basename(fpath)}')
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print('Exam keys:', list(data.keys()))
    questions = data.get('questions', [])
    print(f'Questions count: {len(questions)}')
    if questions:
        q = questions[0]
        print('Sample Q keys:', list(q.keys()))
        print('Sample text:', repr(q.get('text', '')[:120]))
        print('Sample answerIndex:', q.get('answerIndex'))
        print('Sample isCanceled:', q.get('isCanceled'), 'canceled:', q.get('canceled'), 'status:', q.get('status'))
        print('Alternatives count:', len(q.get('alternatives', [])))
        for a in q.get('alternatives', []):
            print(f"  idx {a.get('index')}: {repr(a.get('text', '')[:60])}")

