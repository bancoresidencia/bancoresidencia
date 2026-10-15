import pypdf, re, json, glob

reader_pv = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2023_PV.pdf')
full_exam_text = ''
for page in reader_pv.pages[2:]:
    full_exam_text += '\n' + page.extract_text()

# 8 remaining numbers
nums = [83, 84, 103, 105, 109, 111, 115, 119]
print("--- PDF QUESTIONS ---")
for n in nums:
    # search around question number
    m = re.search(r'\n\s*' + str(n) + r'\s*\n([^\n]+(?:\n[^\n]+){1,6})', full_exam_text)
    if m:
        snippet = re.sub(r'\s+', ' ', m.group(1))[:200]
        print(f"#{n}: {snippet}")

print("\n--- DB QUESTIONS ---")
db_ids = [
    'bf253702-8dd9-4a67-8567-827406a4aafb',
    '3e57bf94-4524-4d7e-a0f5-43c80a41c2c2',
    'b606efff-333f-4924-9fb6-27cff86e385b',
    '16cba2af-2114-40c5-88d0-3ab8e7d619df',
    'ff9fcee2-2850-4158-bca8-baf637f6befe',
    '5f4bdfdc-a532-42fe-91e1-7ee1a3fa79ff',
    'b4ca5066-76bb-4e14-8344-a935875e8ea8',
    '17385b81-3a7a-4760-865f-fcaed467d08b'
]

files = glob.glob('data/*_final_questions.json')
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        if q['id'] in db_ids:
            st = re.sub(r'\s+', ' ', q.get('statement', ''))
            print(f"ID: {q['id']} | Spec: {f.split('\\')[-1][:12]} | Text: {st[:140]}...")
