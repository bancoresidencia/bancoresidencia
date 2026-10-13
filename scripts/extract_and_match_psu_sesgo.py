import os, sys, json, re, unicodedata, pypdf
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

print("="*80)
print("EXTRATOR E HOMOLOGADOR DE PDFS: PSU-MG, SES-GO E UNICAMP")
print("="*80)

# 1. PARSE GABARITOS SES-GO
print("\n1. Extraindo gabaritos oficiais da SES-GO...")
ses_go_keys = {}

ses_go_dir = r'data\official_exams\SES_GO'
for f in os.listdir(ses_go_dir):
    if not f.endswith('.pdf') or not any(k in f.lower() for k in ['gb', 'gabarito']):
        continue
    
    fp = os.path.join(ses_go_dir, f)
    try:
        reader = pypdf.PdfReader(fp)
        txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        
        exam_key = f.replace('.pdf', '')
        answers = {}
        
        # Padrão SES-GO: Linhas de números seguidas de linhas de letras (01 02 03... / C B B...)
        for i in range(len(lines) - 1):
            nums = re.findall(r'\b\d{1,2}\b', lines[i])
            if len(nums) >= 4 and len(nums) <= 10:
                letters = lines[i+1].split()
                if len(nums) == len(letters):
                    for n, l in zip(nums, letters):
                        qn = int(n)
                        l_up = l.upper()
                        if l_up in ['A', 'B', 'C', 'D', 'E']:
                            answers[qn] = l_up
                        elif l_up in ['X', 'ANULADA', 'NULA']:
                            answers[qn] = 'ANULADA'
        
        # Padrão alternativo: 1-A, 01 - B
        if len(answers) < 20:
            pairs = re.findall(r'\b(\d{1,2})\s*[-–.)\t ]{1,4}\s*([A-E]|ANULADA|NULA|X)\b', txt, re.I)
            for qn, ans in pairs:
                qn_int = int(qn)
                if 1 <= qn_int <= 100:
                    answers[qn_int] = 'ANULADA' if ans.upper() in ['X', 'NULA', 'ANULADA'] else ans.upper()

        if len(answers) >= 20:
            ses_go_keys[exam_key] = answers
            print(f"  • {f[:45]}: {len(answers)} questões mapeadas")
    except Exception as e:
        print(f"  • Erro em {f}: {e}")

print(f"Total de provas SES-GO com gabarito: {len(ses_go_keys)}")

# 2. PARSE GABARITOS PSU-MG
print("\n2. Extraindo gabaritos oficiais do PSU-MG (AREMG)...")
psu_keys = {}
psu_dir = r'data\official_exams\PSU_MG'

for f in sorted(os.listdir(psu_dir)):
    if not f.endswith('.pdf') or not any(k in f.lower() for k in ['gb', 'gabarito']):
        continue
    
    fp = os.path.join(psu_dir, f)
    try:
        reader = pypdf.PdfReader(fp)
        txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
        
        exam_key = f.replace('.pdf', '')
        answers = {}
        
        # Padrão PSU-MG: 1. C ou 01. C ou 1-C
        pairs = re.findall(r'\b(\d{1,3})\s*[-–.)\t ]{1,4}\s*([A-E]|ANULADA|NULA|X)\b', txt, re.I)
        for qn, ans in pairs:
            qn_int = int(qn)
            if 1 <= qn_int <= 100:
                answers[qn_int] = 'ANULADA' if ans.upper() in ['X', 'NULA', 'ANULADA'] else ans.upper()
                
        if len(answers) >= 25:
            psu_keys[exam_key] = answers
            if 'GERAL' in exam_key.upper() or len(psu_keys) <= 5:
                print(f"  • {f[:45]}: {len(answers)} questões mapeadas")
    except Exception as e:
        pass

print(f"Total de provas PSU-MG com gabarito: {len(psu_keys)} provas")

# 3. EXTRAÇÃO DE TEXTO DOS CADERNOS DE PROVA
print("\n3. Extraindo enunciados dos cadernos de prova oficiais...")

def extract_pdf_questions(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
        
        pattern = r'(?:QUEST(?:ÃO|O|AO)\s+(\d{1,3})|(?:\n\s*(\d{1,3})\s*[\n\.-]))'
        splits = list(re.finditer(pattern, txt, re.IGNORECASE))
        questions = {}
        valid_splits = []
        for m in splits:
            qn_str = m.group(1) or m.group(2)
            if qn_str:
                qn = int(qn_str)
                if 1 <= qn <= 120:
                    valid_splits.append((qn, m.start()))
        
        for i, (qn, s_idx) in enumerate(valid_splits):
            e_idx = valid_splits[i+1][1] if i+1 < len(valid_splits) else len(txt)
            if e_idx - s_idx > 50:
                questions[qn] = txt[s_idx:e_idx]
        return questions
    except Exception:
        return {}

exam_questions_index = {}

# Cadernos SES-GO
for f in os.listdir(ses_go_dir):
    if f.endswith('.pdf') and not any(k in f.lower() for k in ['gb', 'gabarito']):
        qs = extract_pdf_questions(os.path.join(ses_go_dir, f))
        if qs:
            exam_questions_index[f"SES_GO_{f}"] = qs
            print(f"  • Caderno SES-GO {f[:40]}: {len(qs)} questões extraídas")

# Cadernos PSU-MG
for f in os.listdir(psu_dir):
    if f.endswith('.pdf') and any(k in f.lower() for k in ['provageral', 'prova-geral', 'pediatria', 'ginecologia', 'cirurgia']) and not any(k in f.lower() for k in ['gb', 'gabarito']):
        qs = extract_pdf_questions(os.path.join(psu_dir, f))
        if qs:
            exam_questions_index[f"PSU_MG_{f}"] = qs
            print(f"  • Caderno PSU-MG {f[:40]}: {len(qs)} questões extraídas")

# Cadernos UNICAMP
unicamp_dir = r'data\official_exams\UNICAMP'
for f in os.listdir(unicamp_dir):
    if f.endswith('.pdf') and not any(k in f.lower() for k in ['gb', 'gabarito']):
        qs = extract_pdf_questions(os.path.join(unicamp_dir, f))
        if qs:
            exam_questions_index[f"UNICAMP_{f}"] = qs
            print(f"  • Caderno UNICAMP {f[:40]}: {len(qs)} questões extraídas")

# 4. CRIPTOGRAFIA DE BUSCA E PAREAMENTO CONTRA O BANCO DE QUESTÕES
print("\n4. Cruzando cadernos e gabaritos contra o banco de questões...")

ngram_index = defaultdict(list)
for ex_id, q_dict in exam_questions_index.items():
    for qn, q_text in q_dict.items():
        words = norm(q_text).split()
        if len(words) >= 8:
            for i in range(0, min(len(words) - 7, 30), 2):
                ng = ' '.join(words[i:i+8])
                ngram_index[ng].append((ex_id, qn))

print(f"Total de n-grams dos cadernos indexados: {len(ngram_index)}")

# Carrega e atualiza os arquivos do banco
specialty_files = [
  'data/urologia_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/clinica_medica_final_questions.json'
]

matches_found = 0
matches_by_banca = defaultdict(int)

for sf in specialty_files:
    if not os.path.exists(sf): continue
    with open(sf, 'r', encoding='utf-8') as fp:
        q_list = json.load(fp)
    
    modified = False
    for q in q_list:
        existing = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
        if existing or q.get('isAnulada') or q.get('is_anulada'):
            continue
            
        st = norm(q.get('statement') or '')
        words = st.split()
        if len(words) < 8:
            continue
            
        hits = defaultdict(int)
        for i in range(0, min(len(words) - 7, 30), 2):
            ng = ' '.join(words[i:i+8])
            if ng in ngram_index:
                for ex_id, qn in ngram_index[ng]:
                    hits[(ex_id, qn)] += 1
                    
        if hits:
            best_cand, hit_count = max(hits.items(), key=lambda x: x[1])
            if hit_count >= 3:
                ex_id, qn = best_cand
                
                # Procura gabarito correspondente
                ans = None
                # Se for SES-GO
                if 'SES_GO' in ex_id:
                    for k, g_dict in ses_go_keys.items():
                        if qn in g_dict:
                            ans = g_dict[qn]
                            banca_tag = 'SES-GO'
                            break
                # Se for PSU-MG
                elif 'PSU_MG' in ex_id:
                    for k, g_dict in psu_keys.items():
                        if qn in g_dict:
                            ans = g_dict[qn]
                            banca_tag = 'PSU-MG'
                            break
                            
                if ans:
                    if ans == 'ANULADA':
                        q['is_anulada'] = True
                        q['isAnulada'] = True
                    else:
                        q['correct_answer'] = ans
                        q['correctAnswer'] = ans
                    q['commentary'] = q.get('commentary') or f"Gabarito Oficial Homologado - {banca_tag} Questão {qn}."
                    q['official_audit'] = {
                        'verified': True,
                        'banca': banca_tag,
                        'exam_id': ex_id,
                        'question_number': qn,
                        'answer': ans
                    }
                    matches_found += 1
                    matches_by_banca[banca_tag] += 1
                    modified = True
                    
    if modified:
        with open(sf, 'w', encoding='utf-8') as fp:
            json.dump(q_list, fp, ensure_ascii=False, indent=2)

print("\n" + "="*80)
print(f"🏁 HOMOLOGAÇÃO DE PSU-MG E SES-GO CONCLUÍDA:")
print(f" • Novas questões homologadas com gabarito oficial: {matches_found}")
for b, cnt in matches_by_banca.items():
    print(f"   - {b}: +{cnt} questões")
print("="*80)
