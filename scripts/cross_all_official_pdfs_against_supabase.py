import os
import re
import json
import glob
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

def run_fase1_cross():
    print("========================================================================")
    print("📂 FASE 1: PARSER E CRUZAMENTO UNIVERSAL DE PDFS OFICIAIS")
    print("   Varrendo todos os cadernos e gabaritos em data/official_exams/")
    print("   Ingestão Direta no Supabase Ativa conforme autorização")
    print("========================================================================\n")

    # 1. Carrega pendências do Supabase (paginado)
    print("📥 Baixando todas as pendências ativas do Supabase...")
    all_pending = []
    offset = 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.'')&select=id,code,institution,year,statement,options&offset={offset}&limit=1000",
            headers=headers
        )
        data = r.json()
        if not data: break
        all_pending.extend(data)
        offset += len(data)
        if len(data) < 1000: break

    print(f"Total de pendências carregadas do Supabase: {len(all_pending)}")

    # Indexa pendências pelo prefixo de 8 palavras
    prefix_pending = {}
    for p in all_pending:
        clean = clean_text(p.get('statement', ''))
        words = clean.split()[:8]
        if words:
            k = ' '.join(words)
            if k not in prefix_pending: prefix_pending[k] = []
            prefix_pending[k].append(p)

    # 2. Busca todas as provas e gabaritos
    pv_files = glob.glob('data/official_exams/**/*.pdf', recursive=True)
    provas = [f for f in pv_files if 'PV_' in os.path.basename(f) or 'PROVA' in os.path.basename(f).upper() or 'TPN' in os.path.basename(f)]
    
    total_homologadas = 0

    for pv in provas:
        pv_name = os.path.basename(pv)
        pv_dir = os.path.dirname(pv)

        # Acha gabarito
        stem = pv_name.replace('PV_', '').replace('PROVA_', '').replace('.pdf', '')
        gbs = glob.glob(f"{pv_dir}/*{stem}*.pdf")
        gbs = [g for g in gbs if 'GB' in os.path.basename(g) or 'GABARITO' in os.path.basename(g) or 'TPN' in os.path.basename(g)]
        
        if not gbs:
            # Fallback gabarito na mesma pasta
            gbs = glob.glob(f"{pv_dir}/*GB*.pdf") + glob.glob(f"{pv_dir}/*Gabarito*.pdf")

        if not gbs:
            continue

        gb = gbs[0]
        gb_name = os.path.basename(gb)

        answers = parse_gabarito(gb)
        questions = parse_prova(pv)

        if not answers or not questions:
            continue

        print(f"\n🔍 Processando Prova: {pv_name} ({len(questions)} Qs) com {gb_name} ({len(answers)} Ans)...")

        matched_in_pdf = 0
        for num, q_data in questions.items():
            gb_letter = answers.get(num)
            if not gb_letter: continue

            # Procura candidatos pelo prefixo
            clean_q = clean_text(q_data['statement'])
            words = clean_q.split()[:8]
            if not words: continue
            k = ' '.join(words)

            candidates = prefix_pending.get(k, [])
            for p in candidates:
                sim_stmt = dice_similarity(p['statement'], q_data['statement'])
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
                    p_opts = p.get('options', [])
                    if isinstance(p_opts, str):
                        try: p_opts = json.loads(p_opts)
                        except: p_opts = []

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
                        # INGESTÃO DIRETA NO SUPABASE
                        up_res = requests.patch(
                            f"{SUPABASE_URL}/rest/v1/questions?id=eq.{p['id']}",
                            headers=headers,
                            json={
                                'correct_answer': matched_letter,
                                'commentary': f"Gabarito oficial homologado via caderno {pv_name} (Questão {num}) e gabarito {gb_name}."
                            }
                        )
                        if up_res.status_code in [200, 204]:
                            print(f"   ⚡ [SUPABASE] {p['code']} -> [{matched_letter}] (Stmt: {sim_stmt*100:.0f}% | Opt: {sim_opt*100:.0f}%)")
                            matched_in_pdf += 1
                            total_homologadas += 1
                            candidates.remove(p)
                            break

        if matched_in_pdf > 0:
            print(f"   ✅ Total gravadas desta prova: {matched_in_pdf}")

    print(f"\n========================================================================")
    print(f"🏁 FASE 1 CONCLUÍDA: {total_homologadas} novas questões homologadas e gravadas!")
    print(f"========================================================================\n")

if __name__ == '__main__':
    run_fase1_cross()
