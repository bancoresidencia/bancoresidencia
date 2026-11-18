import pypdf
import re
import requests

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f"Bearer {SERVICE_ROLE_KEY}"
}

def clean_text(s):
    if not s: return ''
    s = re.sub(r'<[^>]+>', ' ', s)
    s = s.lower()
    s = re.sub(r'[^a-z0-9]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# Test on SES_GO_2025
reader = pypdf.PdfReader('data/official_exams/SES_GO_2025/PV_ACESSO_DIRETO_2025.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)

print(f"Extracted {len(chunks)//2} questions from PV_ACESSO_DIRETO_2025.")
for i in range(1, min(len(chunks), 7), 2):
    num = chunks[i]
    stmt = chunks[i+1][:120].strip()
    c = clean_text(stmt)
    words8 = ' '.join(c.split()[:8])
    words4 = ' '.join(c.split()[:4])
    print(f"\nPDF Q{num}:")
    print(f"  Raw: {stmt[:80]}")
    print(f"  Words 8: {words8}")
    
    # Query Supabase for matching phrase
    q_term = '%'.join(c.split()[:4])
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?statement=ilike.%{q_term}%&select=id,code,institution,year,correct_answer",
        headers=headers
    )
    res = r.json()
    print(f"  Found in Supabase: {len(res)} questions")
    for r_item in res:
        print(f"    -> Code: {r_item['code']} | Year: {r_item['year']} | Answer: {r_item['correct_answer']}")
