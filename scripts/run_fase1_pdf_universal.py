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
            'status': 'ativo (segundo plano contínuo)',
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

def strip_intro(s):
    clean = clean_text(s)
    intros = [
        'leia o caso clinico a seguir',
        'leia o texto a seguir',
        'com base no caso clinico',
        'considere o caso a seguir',
        'atencao leia o caso',
        'leia o enunciado a seguir',
        'baseado no caso clinico a seguir',
        'clinica medica',
        'cirurgia geral',
        'pediatria',
        'ginecologia e obstetricia',
        'ginecologia',
        'obstetricia',
        'medicina preventiva e social',
        'medicina preventiva',
        'saude coletiva',
        'medicina de familia e comunidade',
        'acesso direto',
        'caderno de questoes'
    ]
    for intro in intros:
        if clean.startswith(intro):
            clean = clean[len(intro):].strip()
    return clean

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

    # Padrão 1: Grade de N colunas (ex: SES-GO, FUBOG)
    for i in range(len(lines) - 1):
        nums = re.findall(r'\b\d{1,3}\b', lines[i])
        raw_letters = re.findall(r'([A-EX\*])\*?', lines[i+1], re.IGNORECASE)
        letters = [l.upper() for l in raw_letters if len(l) == 1]
        if len(nums) >= 2 and len(nums) == len(letters):
            for n, l in zip(nums, letters):
                answers[int(n)] = 'ANULADA' if l in ['X', '*'] else l

    # Padrão 2: Número na linha i, Letra na linha i+1
    for i in range(len(lines) - 1):
        if re.match(r'^\d{1,3}$', lines[i]) and re.match(r'^[A-EX\*]$', lines[i+1], re.IGNORECASE):
            n = int(lines[i])
            l = lines[i+1].upper()
            answers[n] = 'ANULADA' if l in ['X', '*'] else l

    # Padrão 3: Em linha (ex: "01 - A" ou "1. B" ou "Questão 1: C")
    inline_matches = re.findall(r'(?:QUEST[ÃA]O\s*)?\b(\d{1,3})\b[\.\-\s\:\)]+([A-EX\*])\b', txt, re.IGNORECASE)
    for n, l in inline_matches:
        answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    # Padrão 4: Tabela lado a lado (ex: 1 A 2 B 3 C)
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

    chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\.\s+', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt)
    if len(chunks) < 6:
        chunks = re.split(r'\n\s*(\d{1,3})\s*\n', txt)

    questions = {}
    for i in range(1, len(chunks), 2):
        try:
            num = int(chunks[i])
        except:
            continue
        raw = chunks[i+1].strip()
        
        alt_matches = list(re.finditer(r'(?:(?:\(([A-E])\))|(?:^|\n)\s*([A-E])[\.\-\)])\s*([\s\S]*?)(?=(?:(?:\([A-E]\))|(?:^|\n)\s*[A-E][\.\-\)])|$)', raw))
        if len(alt_matches) >= 2:
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
    base_dirs = ['data/official_exams', 'data/incoming_exams']
    all_pdfs = []
    for bd in base_dirs:
        if os.path.exists(bd):
            all_pdfs.extend(glob.glob(f"{bd}/**/*.pdf", recursive=True))

    folders = set(os.path.dirname(p) for p in all_pdfs)
    for folder in sorted(folders):
        folder_pdfs = [p for p in all_pdfs if os.path.dirname(p) == folder]
        
        # Filtra provas reais (exclui convocações, resultados, listas e locais de prova)
        ignore_words = ['RESULTADO', 'CONVOCA', 'LOCAL', 'ESPELHO', 'LISTA', 'ENTREVISTA', 'MATRICULA', 'HORARIO']
        
        provas = [
            p for p in folder_pdfs 
            if any(k in os.path.basename(p).upper() for k in ['PV', 'PROVA', 'CADERNO', 'CARDERNO']) 
            and not any(g in os.path.basename(p).upper() for g in ['GB', 'GABARITO', 'RECURSO'] + ignore_words)
        ]
        
        # Filtra gabaritos reais (exclui listas de aprovados e resultados gerais)
        gabs = [
            p for p in folder_pdfs 
            if any(k in os.path.basename(p).upper() for k in ['GB', 'GABARITO'])
            and not any(ig in os.path.basename(p).upper() for ig in ignore_words)
        ]

        for pv in provas:
            # 1. Checagem exata por espelhamento direto PV_ -> GB_
            exact_gb = pv.replace('PV_', 'GB_')
            if os.path.exists(exact_gb):
                pairs.append({'prova': pv, 'gabarito': exact_gb})
                continue

            pv_base = os.path.basename(pv).upper()
            t1 = pv_base.replace('PV_', 'GB_').replace('PROVA_', 'GABARITO_').replace('CADERNO_DE_QUESTAO', 'GABARITO_FINAL')
            
            # Detecta versão (ex: VERSAO_1A, V1A, VERSAO 1A)
            v_match = re.search(r'(VERS[AÃ]O[_\s\-]*\d[A-D]|V\d[A-D])', pv_base)
            version_str = v_match.group(1).replace('-', '_').replace(' ', '_') if v_match else None
            
            # Candidatos a gabarito para esta prova
            cand_gabs = gabs
            if version_str:
                matched_v = [g for g in cand_gabs if version_str in os.path.basename(g).upper().replace('-', '_').replace(' ', '_')]
                if matched_v:
                    cand_gabs = matched_v

            # Prioriza Gabarito Final ou Definitivo
            def_gabs = [g for g in cand_gabs if any(d in os.path.basename(g).upper() for d in ['FINAL', 'DEF', 'RETIFICADO', 'OFICIAL'])]
            best = def_gabs[0] if def_gabs else (cand_gabs[0] if cand_gabs else None)

            if best:
                pairs.append({'prova': pv, 'gabarito': best})

    return pairs

PARSED_PROVA_CACHE = {}
PARSED_GABARITO_CACHE = {}

def get_cached_prova(pv_path):
    mtime = os.path.getmtime(pv_path) if os.path.exists(pv_path) else 0
    cached = PARSED_PROVA_CACHE.get(pv_path)
    if cached and cached.get('mtime') == mtime:
        return cached['data']
    data = parse_prova(pv_path)
    PARSED_PROVA_CACHE[pv_path] = {'mtime': mtime, 'data': data}
    return data

def get_cached_gabarito(gb_path):
    mtime = os.path.getmtime(gb_path) if os.path.exists(gb_path) else 0
    cached = PARSED_GABARITO_CACHE.get(gb_path)
    if cached and cached.get('mtime') == mtime:
        return cached['data']
    data = parse_gabarito(gb_path)
    PARSED_GABARITO_CACHE[gb_path] = {'mtime': mtime, 'data': data}
    return data

def run_fase1_cycle():
    print("========================================================================")
    print("🚀 FASE 1: MONITOR & PARSER UNIVERSAL DE PDFS (DAEMON CONTÍNUO)")
    print("   Execução em Segundo Plano com Ingestão Estrita de Gabarito (Sem Comentários)")
    print("   Dual-Gate: Enunciado >= 85% E Alternativa Vencedora >= 85%")
    print("========================================================================\n")

    # 1. Carrega todas as pendências ativas do Supabase
    all_pending = []
    offset = 0
    step = 1000

    print("📥 Conectando ao Supabase para carregar pendências ativas...", flush=True)

    while True:
        req_headers = {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
            'Range': f"{offset}-{offset + step - 1}"
        }
        try:
            r = requests.get(
                f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,institution,year,statement,options&order=id.asc",
                headers=req_headers,
                timeout=25
            )
        except Exception as e:
            print(f"⚠️ Erro de rede ao buscar pendências ({offset}): {e}", flush=True)
            break

        if r.status_code not in [200, 206]:
            break
        data = r.json()
        if not data or not isinstance(data, list):
            break
        all_pending.extend(data)
        offset += len(data)
        print(f"   Carregadas {len(all_pending)} pendências...", flush=True)
        if len(data) < step:
            break

    print(f"📥 Total de pendências ativas carregadas no cache: {len(all_pending)}", flush=True)

    # Indexa pendências pelo prefixo e pelo texto limpo sem introduções genéricas
    index_map = {}
    word_index = {}
    for p in all_pending:
        raw_stmt = p.get('statement', '')
        c1 = clean_text(raw_stmt)
        c2 = strip_intro(raw_stmt)
        
        # Gera chaves de prefixo de 4, 6 e 8 palavras
        w1 = c1.split()
        w2 = c2.split()
        for w_list in [w1, w2]:
            for n_words in [4, 6, 8]:
                if len(w_list) >= n_words:
                    k = ' '.join(w_list[:n_words])
                    if k not in index_map: index_map[k] = []
                    if p not in index_map[k]: index_map[k].append(p)

        # Indexa por palavras significativas (>= 6 letras) para fallback
        unique_long_words = set(w for w in w1 if len(w) >= 6)
        for w in unique_long_words:
            if w not in word_index: word_index[w] = []
            word_index[w].append(p)

    pairs = find_exam_pairs()
    print(f"📚 Total de cadernos oficiais catalogados para varredura: {len(pairs)}\n")

    total_homologadas = 0

    for idx, pair in enumerate(pairs):
        pv_path = pair['prova']
        gb_path = pair['gabarito']
        pv_name = os.path.basename(pv_path)
        gb_name = os.path.basename(gb_path)

        print(f"   [{idx+1}/{len(pairs)}] Varrendo caderno: {pv_name}...", flush=True)

        questions = get_cached_prova(pv_path)
        answers = get_cached_gabarito(gb_path)

        if not questions or not answers:
            continue

        matched_in_pair = 0

        for num, q_data in questions.items():
            ans_letter = answers.get(num)
            if not ans_letter: continue

            c1 = clean_text(q_data['statement'])
            c2 = strip_intro(q_data['statement'])
            
            # Busca candidatos
            candidates = []
            for c_str in [c1, c2]:
                w_list = c_str.split()
                for n_words in [8, 6, 4]:
                    if len(w_list) >= n_words:
                        k = ' '.join(w_list[:n_words])
                        if k in index_map:
                            candidates.extend(index_map[k])
                            break
                if candidates: break

            # Fallback por interseção de palavras raras
            if not candidates:
                q_long_words = [w for w in c1.split() if len(w) >= 6]
                if len(q_long_words) >= 3:
                    cand_counts = {}
                    for w in q_long_words[:8]:
                        for match_p in word_index.get(w, []):
                            cand_counts[match_p['id']] = (cand_counts.get(match_p['id'], (0, match_p))[0] + 1, match_p)
                    for pid, (cnt, match_p) in cand_counts.items():
                        if cnt >= 3:
                            candidates.append(match_p)

            # Deduplica candidatos
            unique_candidates = {c['id']: c for c in candidates}.values()

            for p in list(unique_candidates):
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
                        # INGESTÃO DIRETA NO SUPABASE - APENAS O GABARITO (SEM COMENTÁRIOS)
                        up_headers = {
                            'apikey': SERVICE_ROLE_KEY,
                            'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        }
                        up_res = requests.patch(
                            f"{SUPABASE_URL}/rest/v1/questions?id=eq.{p['id']}",
                            headers=up_headers,
                            json={
                                'correct_answer': matched_letter
                            }
                        )

                        if up_res.status_code in [200, 204]:
                            print(f"   ⚡ [SUPABASE FASE 1] {p['code']} -> [{matched_letter}] (Stmt: {sim_stmt*100:.0f}% | Opt: {sim_opt*100:.0f}%)", flush=True)
                            
                            # Registra no log live unificado do dashboard
                            log_to_master_live({
                                'code': p['code'],
                                'gabarito': matched_letter,
                                'origem': f"Fase 1 PDF ({pv_name[:25]})",
                                'status': 'Gravado no Supabase (Apenas Gabarito)',
                                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                            })

                            matched_in_pair += 1
                            total_homologadas += 1
                            update_status(total_homologadas, idx + 1)
                            break

        if matched_in_pair > 0:
            print(f"   ✅ Gravadas de {pv_name}: +{matched_in_pair} questões", flush=True)

    return total_homologadas

def main():
    while True:
        try:
            novas = run_fase1_cycle()
            print(f"\n💤 Ciclo da Fase 1 finalizado (+{novas} homologadas). Aguardando 15s para novo ciclo em segundo plano...", flush=True)
            time.sleep(15)
        except Exception as e:
            print(f"⚠️ Erro no ciclo da Fase 1: {e}. Reiniciando em 20s...", flush=True)
            time.sleep(20)

if __name__ == '__main__':
    main()
