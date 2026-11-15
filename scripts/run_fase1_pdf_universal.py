import os
import re
import json
import glob
import time
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
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

MASTER_LIVE_PATH = 'data/relatorio_gabaritos_sessao_live.json'
PIPELINE_STATUS_PATH = 'data/pipeline_status.json'

def log_to_master_live(record):
    master = {'totalGravadas': 0, 'questoes': []}
    if os.path.exists(MASTER_LIVE_PATH):
        try:
            with open(MASTER_LIVE_PATH, 'r', encoding='utf-8') as f:
                master = json.load(f)
        except:
            pass

    # Evita duplicação por código
    existing_codes = {q['code'] for q in master.get('questoes', []) if 'code' in q}
    if record['code'] not in existing_codes:
        master['questoes'].append(record)
        master['totalGravadas'] = len(master['questoes'])
        master['ultimaAtualizacao'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        with open(MASTER_LIVE_PATH, 'w', encoding='utf-8') as f:
            json.dump(master, f, ensure_ascii=False, indent=2)

def update_status(homologadas, total_processed):
    try:
        status = {}
        if os.path.exists(PIPELINE_STATUS_PATH):
            with open(PIPELINE_STATUS_PATH, 'r', encoding='utf-8') as f:
                status = json.load(f)
        if 'stats' not in status: status['stats'] = {}
        status['stats']['fase1Homologadas'] = homologadas
        status['fase1'] = {
            'homologadas': homologadas,
            'totalProcessado': total_processed,
            'status': 'ativo',
            'lastUpdate': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }
        with open(PIPELINE_STATUS_PATH, 'w', encoding='utf-8') as f:
            json.dump(status, f, ensure_ascii=False, indent=2)
    except:
        pass

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

    # Padrão 1: Número na linha i, Letra na linha i+1
    for i in range(len(lines) - 1):
        if re.match(r'^\d{1,3}$', lines[i]) and re.match(r'^[A-EX\*]$', lines[i+1], re.IGNORECASE):
            n = int(lines[i])
            l = lines[i+1].upper()
            answers[n] = 'ANULADA' if l in ['X', '*'] else l

    # Padrão 2: Em linha (ex: "01 - A" ou "1. B" ou "Questão 1: C")
    inline_matches = re.findall(r'(?:QUEST[ÃA]O\s*)?\b(\d{1,3})\b[\.\-\s\:\)]+([A-EX\*])\b', txt, re.IGNORECASE)
    for n, l in inline_matches:
        answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    # Padrão 3: Tabela lado a lado (ex: 1 A 2 B 3 C)
    for line in lines:
        pairs = re.findall(r'\b(\d{1,3})\s+([A-EX\*])\b', line, re.IGNORECASE)
        if len(pairs) >= 2:
            for n, l in pairs:
                answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    return answers

def parse_prova(pv_path):
    try:
        reader = pypdf.PdfReader(pv_path)
        txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    except:
        return {}

    # Divisão por Questão
    chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\.\s+', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt)

    questions = {}
    for i in range(1, len(chunks), 2):
        num = int(chunks[i])
        raw = chunks[i+1].strip()
        
        # Procura alternativas A, B, C, D, E (em formatos (A), A), A., [A])
        alt_matches = list(re.finditer(r'(?:(?:\(([A-E])\))|(?:^|\n)\s*([A-E])[\.\-\)])\s*([\s\S]*?)(?=(?:(?:\([A-E]\))|(?:^|\n)\s*[A-E][\.\-\)])|$)', raw))
        if alt_matches:
            stmt = raw[:alt_matches[0].start()].strip()
            opts = []
            for m in alt_matches:
                letter = (m.group(1) or m.group(2)).upper()
                text = m.group(3).strip()
                opts.append({'letter': letter, 'text': text})
            questions[num] = {'statement': stmt, 'options': opts}
    return questions

def find_exam_pairs():
    pairs = []
    base_dir = 'data/official_exams'
    all_pdfs = glob.glob(f"{base_dir}/**/*.pdf", recursive=True)

    # Agrupa por pasta
    folders = set(os.path.dirname(p) for p in all_pdfs)
    for folder in folders:
        folder_pdfs = [p for p in all_pdfs if os.path.dirname(p) == folder]
        provas = [p for p in folder_pdfs if any(k in os.path.basename(p).upper() for k in ['PV', 'PROVA', 'CADERNO'])]
        gabs = [p for p in folder_pdfs if any(k in os.path.basename(p).upper() for k in ['GB', 'GABARITO'])]

        for pv in provas:
            pv_base = os.path.basename(pv)
            # Tenta achar gabarito específico
            year_match = re.search(r'\b(20\d\d)\b', pv_base)
            year = year_match.group(1) if year_match else None
            
            best_gb = None
            if year:
                matching_year_gabs = [g for g in gabs if year in os.path.basename(g)]
                if matching_year_gabs:
                    # Prefere definitivo
                    definitivos = [g for g in matching_year_gabs if 'DEF' in os.path.basename(g).upper() or 'FINAL' in os.path.basename(g).upper()]
                    best_gb = definitivos[0] if definitivos else matching_year_gabs[0]

            if not best_gb and gabs:
                best_gb = gabs[0]

            if best_gb:
                pairs.append({'prova': pv, 'gabarito': best_gb})

    return pairs

def main():
    print("========================================================================")
    print("🚀 FASE 1: PARSER E CRUZAMENTO UNIVERSAL DE PDFS OFICIAIS (LIVE)")
    print("   Execução contínua paralela com Ingestão Direta no Supabase")
    print("   Dual-Gate: Enunciado >= 85% E Alternativa Vencedora >= 85%")
    print("========================================================================\n")

    # 1. Carrega todas as pendências do Supabase
    print("📥 Baixando pendências do Supabase em lotes de 1000...")
    all_pending = []
    offset = 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.'')&select=id,code,institution,year,statement,options&offset={offset}&limit=1000",
            headers=headers
        )
        data = r.json()
        if not data or not isinstance(data, list): break
        all_pending.extend(data)
        offset += len(data)
        if len(data) < 1000: break

    print(f"✅ Total de pendências carregadas: {len(all_pending)}")

    # Indexa pendências pelo prefixo de 8 palavras
    prefix_index = {}
    for p in all_pending:
        clean = clean_text(p.get('statement', ''))
        words = clean.split()[:8]
        if words:
            k = ' '.join(words)
            if k not in prefix_index: prefix_index[k] = []
            prefix_index[k].append(p)

    pairs = find_exam_pairs()
    print(f"📚 Total de pares Prova <-> Gabarito catalogados: {len(pairs)}\n")

    total_homologadas = 0

    for idx, pair in enumerate(pairs):
        pv_path = pair['prova']
        gb_path = pair['gabarito']
        pv_name = os.path.basename(pv_path)
        gb_name = os.path.basename(gb_path)

        questions = parse_prova(pv_path)
        answers = parse_gabarito(gb_path)

        if not questions or not answers:
            continue

        print(f"[{idx+1}/{len(pairs)}] 🔍 {pv_name} ({len(questions)} Qs) <-> {gb_name} ({len(answers)} Ans)")

        matched_in_pair = 0

        for num, q_data in questions.items():
            ans_letter = answers.get(num)
            if not ans_letter: continue

            clean_q = clean_text(q_data['statement'])
            words = clean_q.split()[:8]
            if not words: continue
            k = ' '.join(words)

            candidates = prefix_index.get(k, [])
            for p in list(candidates):
                sim_stmt = dice_similarity(p['statement'], q_data['statement'])
                if sim_stmt >= 0.85:
                    winning_opt_text = ''
                    if ans_letter == 'ANULADA':
                        winning_opt_text = 'ANULADA'
                    else:
                        for o in q_data['options']:
                            if o['letter'] == ans_letter:
                                winning_opt_text = o['text']
                                break

                    p_opts = p.get('options', [])
                    if isinstance(p_opts, str):
                        try: p_opts = json.loads(p_opts)
                        except: p_opts = []

                    matched_letter = None
                    sim_opt = 0.0

                    if ans_letter == 'ANULADA':
                        matched_letter = 'ANULADA'
                        sim_opt = 1.0
                    else:
                        for po in p_opts:
                            s_o = dice_similarity(po.get('text', ''), winning_opt_text)
                            if s_o >= 0.85:
                                matched_letter = po.get('letter', '').upper()
                                sim_opt = s_o
                                break

                    if matched_letter:
                        # INGESTÃO DIRETA NO SUPABASE
                        up_res = requests.patch(
                            f"{SUPABASE_URL}/rest/v1/questions?id=eq.{p['id']}",
                            headers=headers,
                            json={
                                'correct_answer': matched_letter,
                                'commentary': f"Gabarito oficial homologado via caderno {pv_name} (Questão {num}) e gabarito oficial {gb_name}."
                            }
                        )

                        if up_res.status_code in [200, 204]:
                            print(f"   ⚡ [SUPABASE LIVE] {p['code']} -> [{matched_letter}] (Stmt: {sim_stmt*100:.0f}% | Opt: {sim_opt*100:.0f}%)")
                            
                            # Registra no log live unificado do dashboard
                            log_to_master_live({
                                'code': p['code'],
                                'gabarito': matched_letter,
                                'origem': f"Fase 1 PDF ({pv_name[:25]})",
                                'status': 'Gravado no Supabase',
                                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                            })

                            matched_in_pair += 1
                            total_homologadas += 1
                            candidates.remove(p)
                            update_status(total_homologadas, idx + 1)
                            break

        if matched_in_pair > 0:
            print(f"   ✅ Gravadas nesta prova: +{matched_in_pair} questões")

    print(f"\n🏁 FASE 1 CONCLUÍDA! Total de novas homologações ingeridas: {total_homologadas}")

if __name__ == '__main__':
    main()
