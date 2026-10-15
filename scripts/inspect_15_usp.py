import glob, json, re

files = glob.glob('data/*_final_questions.json')
db_unmatched = {}
missing_ids = [
    '5a464742-5a80-4005-8264-41182f75ca55',
    'bf253702-8dd9-4a67-8567-827406a4aafb',
    '305baa06-644f-4e89-8d03-6b36d440bee0',
    '68627b21-3d0c-4252-976a-627aa743428b',
    '3e57bf94-4524-4d7e-a0f5-43c80a41c2c2',
    'b606efff-333f-4924-9fb6-27cff86e385b',
    'b630e0e8-7b13-4e89-b69c-77668ff6bdd5',
    '16cba2af-2114-40c5-88d0-3ab8e7d619df',
    '4a089890-c980-44e6-98bc-4aa43b8a8ef1',
    '8c0e4e71-b686-498e-91c2-3e209ec9a27d',
    'ff9fcee2-2850-4158-bca8-baf637f6befe',
    '6c11ef0c-526c-43fa-b236-2eea1b218a42',
    '5f4bdfdc-a532-42fe-91e1-7ee1a3fa79ff',
    'b4ca5066-76bb-4e14-8344-a935875e8ea8',
    '17385b81-3a7a-4760-865f-fcaed467d08b'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        if q.get('id') in missing_ids:
            db_unmatched[q['id']] = (f, q)

print(f"Loaded {len(db_unmatched)} questions to map:")
for qid, (f, q) in db_unmatched.items():
    st = q.get('statement', '')
    # print last 120 chars of statement (which is usually the specific question prompt)
    prompt = st[-150:] if len(st) > 150 else st
    print(f"\nID: {qid} | File: {f.split('\\')[-1]}")
    print(f"Prompt snippet: {prompt}")
