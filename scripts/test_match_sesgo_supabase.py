import os
import re
import json
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

# 2. Carrega pendentes de SES-GO no Supabase
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*SES-GO*&or=(correct_answer.is.null,correct_answer.eq.'')&select=id,code,year,statement,options",
    headers=headers
)
pending = r.json()
print(f"Total pending SES-GO in Supabase: {len(pending)}")

# 3. Parse SES_GO 2026 Acesso Direto PV e GB
reader_pv = pypdf.PdfReader('data/official_exams/SES_GO_2026/PV_ACESSO_DIRETO_A.pdf')
pv_txt = '\n'.join([p.extract_text() for p in reader_pv.pages])
chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', pv_txt)

pv_questions = {}
for i in range(1, len(chunks), 2):
    num = int(chunks[i])
    raw = chunks[i+1].strip()
    alt_matches = list(re.finditer(r'\(([A-E])\)\s*([\s\S]*?)(?=\([A-E]\)|$)', raw))
    if alt_matches:
        stmt = raw[:alt_matches[0].start()].strip()
        opts = [{'letter': m.group(1).upper(), 'text': m.group(2).strip()} for m in alt_matches]
        pv_questions[num] = {'statement': stmt, 'options': opts}

# GB
reader_gb = pypdf.PdfReader('data/official_exams/SES_GO_2026/GB_ACESSO_DIRETO_A.pdf')
gb_txt = '\n'.join([p.extract_text() for p in reader_gb.pages])
lines = [l.strip() for l in gb_txt.split('\n') if l.strip()]
answers = {}
for i in range(len(lines) - 1):
    num_match = re.findall(r'\b\d{1,3}\b', lines[i])
    letter_match = re.findall(r'\b[A-EX\*]\b', lines[i+1], re.IGNORECASE)
    if len(num_match) >= 3 and len(num_match) == len(letter_match):
        for n, l in zip(num_match, letter_match):
            answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

print(f"Parsed {len(pv_questions)} PV questions and {len(answers)} GB answers.")

# 4. Cruzamento Dual-Gate >= 85%
matches = []
for p in pending:
    p_stmt = p.get('statement', '')
    p_opts = p.get('options', [])
    if isinstance(p_opts, str):
        try: p_opts = json.loads(p_opts)
        except: p_opts = []

    for num, q_data in pv_questions.items():
        gb_letter = answers.get(num)
        if not gb_letter: continue

        sim_stmt = dice_similarity(p_stmt, q_data['statement'])
        if sim_stmt >= 0.85:
            # Check winning option text
            winning_opt_text = ''
            if gb_letter == 'ANULADA':
                winning_opt_text = 'ANULADA'
            else:
                for o in q_data['options']:
                    if o['letter'] == gb_letter:
                        winning_opt_text = o['text']
                        break

            # Find matching option in pending
            matched_letter = None
            sim_opt = 0.0
            if gb_letter == 'ANULADA':
                matched_letter = 'ANULADA'
                sim_opt = 1.0
            else:
                for p_o in p_opts:
                    s_o = dice_similarity(p_o.get('text', ''), winning_opt_text)
                    if s_o >= 0.85:
                        matched_letter = p_o.get('letter', '').upper()
                        sim_opt = s_o
                        break

            if matched_letter:
                matches.append({
                    'id': p['id'],
                    'code': p['code'],
                    'letter': matched_letter,
                    'sim_stmt': sim_stmt,
                    'sim_opt': sim_opt,
                    'pdf_q_num': num
                })
                break

print(f"\n🎉 Matches Found for SES-GO Acesso Direto: {len(matches)}")
for m in matches[:10]:
    print(f" - {m['code']} -> [{m['letter']}] (Q{m['pdf_q_num']} | Stmt: {m['sim_stmt']*100:.0f}% | Opt: {m['sim_opt']*100:.0f}%)")
