import json
import re
import requests
import pypdf

# 1. Carrega credenciais do .env.local
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
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json'
}

def clean_text(s):
    if not s: return ''
    s = re.sub(r'<[^>]+>', ' ', s)
    s = s.lower()
    s = re.sub(r'[^a-z0-9]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def dice_similarity(s1, s2):
    t1 = clean_text(s1)
    t2 = clean_text(s2)
    if t1 == t2: return 1.0
    w1 = set(t1.split())
    w2 = set(t2.split())
    if not w1 or not w2: return 0.0
    inter = len(w1.intersection(w2))
    return round((2 * inter) / (len(w1) + len(w2)), 2)

# Parse GB V1A
reader_gb = pypdf.PdfReader('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf')
gb_txt = '\n'.join([p.extract_text() for p in reader_gb.pages if p.extract_text()])
gb_lines = [l.strip() for l in gb_txt.split('\n') if l.strip()]
answers_v1a = {}
for i in range(len(gb_lines) - 1):
    if re.match(r'^\d{1,3}$', gb_lines[i]) and re.match(r'^[A-D]$', gb_lines[i+1]):
        answers_v1a[int(gb_lines[i])] = gb_lines[i+1]

print(f"Gabarito V1A parsed: {len(answers_v1a)} questões")

# Parse PV V1A
reader_pv = pypdf.PdfReader('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf')
pv_txt = '\n'.join([p.extract_text() for p in reader_pv.pages if p.extract_text()])

chunks = re.split(r'\n\s*(\d{2,3})\.\s+', pv_txt)
questions_v1a = {}
for i in range(1, len(chunks), 2):
    num = int(chunks[i])
    raw = chunks[i+1].strip()
    alt_matches = list(re.finditer(r'\(([A-D])\)\s*([\s\S]*?)(?=\([A-D]\)|$)', raw))
    if alt_matches:
        stmt = raw[:alt_matches[0].start()].strip()
        opts = [{'letter': m.group(1).upper(), 'text': m.group(2).strip()} for m in alt_matches]
        questions_v1a[num] = {'statement': stmt, 'options': opts}

print(f"Prova V1A parsed: {len(questions_v1a)} questões")

# Fetch FUBOG pending from Supabase
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*fubog*&or=(correct_answer.is.null,correct_answer.eq.'')&select=id,code,institution,year,statement,options",
    headers=headers
)
fubog_pending = r.json()
print(f"Pendências FUBOG no Supabase: {len(fubog_pending)}")

matches = []
for p in fubog_pending:
    p_stmt = p['statement']
    p_opts = p.get('options', [])
    if isinstance(p_opts, str):
        try: p_opts = json.loads(p_opts)
        except: p_opts = []

    for num, q_data in questions_v1a.items():
        ans_letter = answers_v1a.get(num)
        if not ans_letter: continue

        sim_stmt = dice_similarity(p_stmt, q_data['statement'])
        if sim_stmt >= 0.85:
            # Check winning option text
            winning_opt_text = ''
            for o in q_data['options']:
                if o['letter'] == ans_letter:
                    winning_opt_text = o['text']
                    break

            matched_letter = None
            sim_opt = 0.0
            for po in p_opts:
                s_o = dice_similarity(po.get('text', ''), winning_opt_text)
                if s_o >= 0.85:
                    matched_letter = po.get('letter', '').upper()
                    sim_opt = s_o
                    break

            if matched_letter:
                matches.append({
                    'id': p['id'],
                    'code': p['code'],
                    'ans': matched_letter,
                    'sim_stmt': sim_stmt,
                    'sim_opt': sim_opt,
                    'q_num': num
                })
                break

print(f"Total Matches FUBOG V1A: {len(matches)}")
for m in matches[:10]:
    print(f"  Match: {m['code']} -> [{m['ans']}] (Stmt: {m['sim_stmt']*100:.0f}%, Opt: {m['sim_opt']*100:.0f}%) via Q{m['q_num']}")
