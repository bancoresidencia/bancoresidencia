import requests
import pypdf
import re

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

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.%ses-go%&year=eq.2026&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,statement,options",
    headers=headers
)
ses_2026 = r.json()
print(f"Total pending SES-GO 2026 in Supabase: {len(ses_2026)}")
for q in ses_2026[:5]:
    print(f"  {q['code']}: {q['statement'][:100]}")

# Inspect PV_ACESSO_DIRETO_A.pdf in SES_GO_2026
reader = pypdf.PdfReader('data/official_exams/SES_GO_2026/PV_ACESSO_DIRETO_A.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
print(f"\nText length in SES_GO_2026 PV_ACESSO_DIRETO_A: {len(txt)}")
chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)
print(f"Chunks found: {len(chunks)}")
if len(chunks) > 2:
    for i in range(1, min(len(chunks), 11), 2):
        print(f"  PDF Q{chunks[i]}: {chunks[i+1][:100].strip()}")
