import pypdf
import re
import requests
import json

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
    s = re.sub(r'<[^>]+>', ' ', s).lower()
    s = re.sub(r'[^a-z0-9]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def dice(s1, s2):
    t1 = set(clean_text(s1).split())
    t2 = set(clean_text(s2).split())
    if not t1 or not t2: return 0.0
    return round(2 * len(t1.intersection(t2)) / (len(t1) + len(t2)), 2)

# Load UERJ pending from Supabase
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.%uerj%&year=eq.2024&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,statement,options",
    headers=headers
)
pending = r.json()
print(f"Pending UERJ 2024 in Supabase: {len(pending)}")

# Extract UERJ 2024 Prova and Gabarito
reader_gb = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf')
txt_gb = '\n'.join([p.extract_text() for p in reader_gb.pages if p.extract_text()])
r_nums = re.findall(r'\bR(\d{1,3})\b', txt_gb)
pos_r100 = txt_gb.find('R100')
ans_letters = re.findall(r'\b([A-DX])\b', txt_gb[pos_r100 + 4:])
answers = {int(n): ('ANULADA' if l == 'X' else l) for n, l in zip(r_nums, ans_letters)}

reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
txt_pv = '\n'.join([p.extract_text() for p in reader_pv.pages[1:] if p.extract_text()])
chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt_pv)
qs = {}
for i in range(1, len(chunks), 2):
    num = int(chunks[i])
    raw = chunks[i+1].strip()
    alt_matches = list(re.finditer(r'(?:^|\n)\s*([a-dA-D])\)\s*([\s\S]*?)(?=(?:^|\n)\s*[a-dA-D]\)|$)', raw))
    if len(alt_matches) >= 3:
        stmt = raw[:alt_matches[0].start()].strip()
        opts = [{'letter': m.group(1).upper(), 'text': m.group(2).strip()} for m in alt_matches]
        qs[num] = {'statement': stmt, 'options': opts}

matches = []
for p in pending:
    for num, q_data in qs.items():
        ans_letter = answers.get(num)
        if not ans_letter: continue
        sim_stmt = dice(p['statement'], q_data['statement'])
        if sim_stmt >= 0.85:
            # check option
            p_opts = p.get('options', [])
            if isinstance(p_opts, str):
                try: p_opts = json.loads(p_opts)
                except: p_opts = []
            
            winning_text = ''
            for o in q_data['options']:
                if o['letter'] == ans_letter:
                    winning_text = o['text']
                    break
            
            matched_letter = None
            sim_opt = 0.0
            for po in p_opts:
                s_o = dice(po.get('text', ''), winning_text)
                if s_o >= 0.85:
                    matched_letter = po.get('letter', '').upper()
                    sim_opt = s_o
                    break
            
            if matched_letter:
                matches.append((p['code'], matched_letter, sim_stmt, sim_opt, num))
                break

print(f"Total Matches found for UERJ 2024: {len(matches)}")
for m in matches[:10]:
    print(f"  Match: {m[0]} -> [{m[1]}] (Stmt: {m[2]*100:.0f}%, Opt: {m[3]*100:.0f}%) via Q{m[4]}")
