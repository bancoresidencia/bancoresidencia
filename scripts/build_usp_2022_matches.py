import json, glob, re, sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Carregar Gabarito Oficial Definitivo da FMUSP 2022 (Áreas Básicas e Acesso Direto)
# Do arquivo oficial baixado (data/official_exams/USP_FUVEST/USP_2022_GB.pdf)
raw_gabarito = """
01 A 41 C 81 D
02 C 42 C 82 A
03 D 43 D 83 B
04 B 44 B 84 A
05 B 45 A 85 B
06 D 46 B 86 C
07 C 47 D 87 C
08 A 48 C 88 D
09 B 49 B 89 A
10 C 50 A 90 B
11 C 51 C 91 C
12 D 52 D 92 A
13 A 53 D 93 C
14 B 54 B 94 B
15 D 55 C 95 C
16 A 56 A 96 C
17 B 57 D 97 A
18 D 58 B 98 C
19 C 59 A 99 D
20 A 60 C 100 D
21 A 61 B
22 C 62 C
23 C 63 D
24 D 64 A
25 B 65 A
26 B 66 B
27 A 67 A
28 D 68 C
29 D 69 C
30 B 70 B
31 B 71 A
32 A 72 D
33 D 73 A
34 C 74 B
35 A 75 D
36 D 76 D
37 B 77 A
38 D 78 B
39 D 79 C
40 A 80 B
"""

official_keys = {}
for m in re.finditer(r'(\d+)\s+([A-E\*X])', raw_gabarito):
    official_keys[int(m.group(1))] = m.group(2)

print(f"Total chaves de gabarito carregadas: {len(official_keys)}")

# 2. Carregar texto da prova extraída
with open('data/official_exams/USP_FUVEST/usp_2022_prova_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Dividir por QUESTÃO
# Procura QUESTÃO 01, QUESTÃO 02, etc.
pattern = re.compile(r'QUEST[ÃA\u00C3\uFFFD]O\s+(\d+)', re.IGNORECASE)
matches = list(pattern.finditer(text))

exam_questions = {}
for i, m in enumerate(matches):
    q_num = int(m.group(1))
    start_pos = m.end()
    end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
    q_text = text[start_pos:end_pos].strip()
    # Limpar quebras de linha estranhas
    q_text = re.sub(r'--- PAGE \d+ ---\s*', '', q_text)
    exam_questions[q_num] = q_text

print(f"Total questões extraídas da prova: {len(exam_questions)}")

# 3. Carregar questões do banco de dados (USP-SP 2022)
files = [f for f in glob.glob('data/*_final_questions.json') if 'all_homologated' not in f]
db_questions = []
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = q.get('institution', '')
        yr = q.get('year', '')
        if any(k in inst.upper() for k in ['USP', 'FMUSP', 'HCFMUSP']) and not any(k in inst.upper() for k in ['RP', 'RIBEIR']):
            if yr == 2022:
                db_questions.append({
                    'file': fpath,
                    'id': q.get('id'),
                    'code': q.get('code'),
                    'statement': q.get('statement', ''),
                    'options': q.get('options', []),
                    'raw_q': q
                })

print(f"Total questões USP-SP 2022 no banco: {len(db_questions)}")

def normalize(txt):
    txt = txt.lower()
    txt = re.sub(r'[^a-z0-9]', '', txt)
    return txt

# Mapear cada questão do banco com a questão do caderno
matched = []
unmatched = []

for db_q in db_questions:
    stmt_norm = normalize(db_q['statement'][:100])
    best_q_num = None
    best_score = 0
    
    for q_num, ex_txt in exam_questions.items():
        ex_norm = normalize(ex_txt[:250])
        # Verificar sobreposição de palavras ou substring
        if stmt_norm[:40] in ex_norm or ex_norm[:40] in stmt_norm:
            best_q_num = q_num
            break
        # fallback: contar palavras coincidentes
        words_db = set(re.findall(r'\w{4,}', db_q['statement'].lower()))
        words_ex = set(re.findall(r'\w{4,}', ex_txt.lower()))
        if words_db:
            common = len(words_db.intersection(words_ex)) / len(words_db)
            if common > best_score and common > 0.45:
                best_score = common
                best_q_num = q_num
                
    if best_q_num is not None:
        matched.append({
            'file': db_q['file'],
            'id': db_q['id'],
            'code': db_q['code'],
            'q_num': best_q_num,
            'official_gabarito': official_keys.get(best_q_num),
            'statement_preview': db_q['statement'][:70]
        })
    else:
        unmatched.append(db_q)

print(f"Matched com sucesso: {len(matched)}")
print(f"Não pareadas: {len(unmatched)}")
if unmatched:
    for u in unmatched:
        print("  UNMATCHED:", u['code'], u['statement'][:60])

with open('data/official_exams/USP_FUVEST/usp_2022_matches.json', 'w', encoding='utf-8') as f:
    json.dump({
        'matched': matched,
        'unmatched_count': len(unmatched),
        'total_db': len(db_questions)
    }, f, indent=2, ensure_ascii=False)

print("Mapeamento salvo em data/official_exams/USP_FUVEST/usp_2022_matches.json")
