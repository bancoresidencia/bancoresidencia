import os
import re
import json
import requests
import pypdf
import glob

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

def parse_gabarito(gb_path):
    try:
        reader = pypdf.PdfReader(gb_path)
        txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    except:
        return {}

    answers = {}
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    for i in range(len(lines) - 1):
        num_match = re.findall(r'\b\d{1,3}\b', lines[i])
        letter_match = re.findall(r'\b[A-EX\*]\b', lines[i+1], re.IGNORECASE)
        if len(num_match) >= 3 and len(num_match) == len(letter_match):
            for n, l in zip(num_match, letter_match):
                answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    for i in range(len(lines) - 1):
        if re.match(r'^\d{1,3}$', lines[i]) and re.match(r'^[A-EX\*]$', lines[i+1], re.IGNORECASE):
            n = int(lines[i])
            l = lines[i+1].upper()
            answers[n] = 'ANULADA' if l in ['X', '*'] else l

    inline_matches = re.findall(r'\b(\d{1,3})[\.\-\s\:]+([A-EX\*])\b', txt, re.IGNORECASE)
    for n, l in inline_matches:
        answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    return answers

def parse_prova(pv_path):
    try:
        reader = pypdf.PdfReader(pv_path)
        txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    except:
        return {}

    chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\.\s+', txt)

    questions = {}
    for i in range(1, len(chunks), 2):
        num = int(chunks[i])
        raw = chunks[i+1].strip()
        alt_matches = list(re.finditer(r'\(([A-E])\)\s*([\s\S]*?)(?=\([A-E]\)|$)', raw))
        if alt_matches:
            stmt = raw[:alt_matches[0].start()].strip()
            opts = [{'letter': m.group(1).upper(), 'text': m.group(2).strip()} for m in alt_matches]
            questions[num] = {'statement': stmt, 'options': opts}
    return questions

# 2. Carrega todas as pendências de SES-GO no Supabase
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*SES-GO*&or=(correct_answer.is.null,correct_answer.eq.'')&select=id,code,year,statement,options",
    headers=headers
)
pending = r.json()
print(f"Total pending SES-GO in Supabase: {len(pending)}")

# 3. Lista todos os pares de PDFs de SES-GO
all_pv_files = glob.glob('data/official_exams/SES_GO*/**/PV_*.pdf', recursive=True) + glob.glob('data/official_exams/SES_GO*/**/*PROVA*.pdf', recursive=True)

all_matched_records = []
unmatched_pending = list(pending)

for pv in all_pv_files:
    pv_dir = os.path.dirname(pv)
    pv_base = os.path.basename(pv)
    
    # Try finding GB in same folder
    gb_candidate = pv.replace('PV_', 'GB_').replace('PROVA_', 'GABARITO_').replace('_PROVA', '_GABARITO')
    if not os.path.exists(gb_candidate):
        # Look for matching name
        stem = pv_base.replace('PV_', '').replace('.pdf', '')
        gbs = glob.glob(f"{pv_dir}/*{stem}*.pdf")
        gbs = [g for g in gbs if 'GB' in os.path.basename(g) or 'GABARITO' in os.path.basename(g)]
        if gbs: gb_candidate = gbs[0]
        else: continue

    answers = parse_gabarito(gb_candidate)
    questions = parse_prova(pv)

    if not answers or not questions:
        continue

    print(f"Scanning {pv_base} ({len(questions)} Qs) with {os.path.basename(gb_candidate)} ({len(answers)} Ans)...")

    for p in list(unmatched_pending):
        p_stmt = p.get('statement', '')
        p_opts = p.get('options', [])
        if isinstance(p_opts, str):
            try: p_opts = json.loads(p_opts)
            except: p_opts = []

        for num, q_data in questions.items():
            gb_letter = answers.get(num)
            if not gb_letter: continue

            sim_stmt = dice_similarity(p_stmt, q_data['statement'])
            if sim_stmt >= 0.85:
                winning_opt_text = ''
                if gb_letter == 'ANULADA':
                    winning_opt_text = 'ANULADA'
                else:
                    for o in q_data['options']:
                        if o['letter'] == gb_letter:
                            winning_opt_text = o['text']
                            break

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
                    all_matched_records.append({
                        'id': p['id'],
                        'code': p['code'],
                        'correct_answer': matched_letter,
                        'commentary': f"Gabarito oficial homologado via caderno oficial {pv_base} (Questão {num}) e gabarito {os.path.basename(gb_candidate)}.",
                        'sim_stmt': sim_stmt,
                        'sim_opt': sim_opt,
                        'pdf_prova': pv_base,
                        'pdf_gabarito': os.path.basename(gb_candidate)
                    })
                    unmatched_pending.remove(p)
                    break

print(f"\n🎉 TOTAL MATCHES ENCONTRADOS PARA SES-GO: {len(all_matched_records)}")
for m in all_matched_records[:15]:
    print(f" - {m['code']} -> [{m['letter']}] (Stmt: {m['sim_stmt']*100:.0f}% | Opt: {m['sim_opt']*100:.0f}% | Prova: {m['pdf_prova']})")

# Salva staging
with open('data/staging_sesgo_oficial_pdfs.json', 'w', encoding='utf-8') as f:
    json.dump(all_matched_records, f, indent=2, ensure_ascii=False)
print("Salvo em data/staging_sesgo_oficial_pdfs.json!")
