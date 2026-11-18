import json
import re
import requests
import pypdf

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

def dice(s1, s2):
    t1 = set(clean_text(s1).split())
    t2 = set(clean_text(s2).split())
    if not t1 or not t2: return 0.0
    return round(2 * len(t1.intersection(t2)) / (len(t1) + len(t2)), 2)

# 1. Busca questoes pendentes de SES-GO
r = requests.get(f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.%ses-go%&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,year,statement&limit=5", headers=headers)
sesgo_qs = r.json()
print(f"Pending SES-GO in Supabase: {len(sesgo_qs)}")
for q in sesgo_qs:
    c = clean_text(q['statement'])
    print(f"\n--- Supabase {q['code']} ({q['year']}) ---")
    print("Raw statement:", q['statement'][:120])
    print("First 8 words:", ' '.join(c.split()[:8]))

# 2. Extrai Questoes de PV_ACESSO_DIRETO_2024.pdf
reader = pypdf.PdfReader('data/official_exams/SES_GO_2024/PV_ACESSO_DIRETO_2024.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
chunks = re.split(r'\n\s*(\d{1,3})\.\s+', txt)
print(f"\nChunks from PV_ACESSO_DIRETO_2024: {len(chunks)}")
if len(chunks) > 2:
    print("PDF Question 1 statement raw:", chunks[2][:120])
    print("PDF Question 1 first 8 words:", ' '.join(clean_text(chunks[2]).split()[:8]))

# Test dice between first 10 PDF questions and the 5 Supabase questions
for i in range(1, min(len(chunks), 21), 2):
    num = chunks[i]
    stmt_pdf = chunks[i+1]
    for q in sesgo_qs:
        d = dice(q['statement'], stmt_pdf)
        if d > 0.5:
            print(f"High similarity ({d}) between PDF Q{num} and Supabase {q['code']}!")
