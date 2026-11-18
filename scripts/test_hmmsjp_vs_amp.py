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

# Load HMMSJP 2026 questions from Supabase
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.%hmmsjp%&year=eq.2026&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,statement,options&limit=10",
    headers=headers
)
hmmsjp_qs = r.json()
print(f"Loaded {len(hmmsjp_qs)} HMMSJP 2026 questions from Supabase:")
for q in hmmsjp_qs[:3]:
    print(f"  {q['code']}: {q['statement'][:100]}")

# Load AMP 2026 PROVA GERAL
reader = pypdf.PdfReader('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
print(f"\nAMP 2026 PROVA GERAL text length: {len(txt)}")

# Check dice match
for q in hmmsjp_qs:
    words = clean_text(q['statement']).split()[:8]
    if not words: continue
    sample_phrase = ' '.join(words[:4])
    if sample_phrase in clean_text(txt):
        print(f"MATCH FOUND in AMP 2026 PROVA GERAL for {q['code']}!")
