import json, glob, re, sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Carregar Gabarito Oficial FMUSP 2021
raw_gabarito = """
01 B 41 B 81 D 
02 A 42 D 82 A 
03 C 43 B 83 C 
04 D 44 A 84 C 
05 * 45 * 85 B 
06 C 46 D 86 D 
07 B 47 C 87 A 
08 D 48 A 88 B 
09 C 49 B 89 C 
10 D 50 C 90 A 
11 A 51 D 91 B 
12 B 52 B 92 A 
13 A 53 A 93 D 
14 C 54 D 94 C 
15 D 55 C 95 * 
16 B 56 B 96 C 
17 D 57 D 97 C 
18 A 58 A 98 D 
19 B 59 D 99 A 
20 C 60 B 100 B 
21 B 61 C 101 C 
22 A 62 D 102 D 
23 D 63 C 103 A 
24 A 64 A 104 C 
25 D 65 B 105 B 
26 C 66 D 106 A 
27 B 67 C 107 D 
28 A 68 A 108 A 
29 A 69 B 109 B 
30 D 70 C 110 C 
31 D 71 A 111 B 
32 C 72 B 112 A 
33 B 73 C 113 D 
34 D 74 D 114 D 
35 A 75 A 115 * 
36 B 76 D 116 C 
37 C 77 C 117 A 
38 B 78 B 118 D 
39 A 79 A 119 C 
40 C 80 B 120 B
"""

official_keys = {}
for m in re.finditer(r'(\d+)\s+([A-E\*X])', raw_gabarito):
    official_keys[int(m.group(1))] = m.group(2)

print(f"Total chaves de gabarito carregadas: {len(official_keys)}")

# 2. Carregar texto da prova extraída
with open('data/official_exams/USP_FUVEST/usp_2021_prova_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'QUEST[ÃA\u00C3\uFFFD]O\s+(\d+)', re.IGNORECASE)
matches = list(pattern.finditer(text))

exam_questions = {}
for i, m in enumerate(matches):
    q_num = int(m.group(1))
    start_pos = m.end()
    end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
    q_text = text[start_pos:end_pos].strip()
    q_text = re.sub(r'--- PAGE \d+ ---\s*', '', q_text)
    exam_questions[q_num] = q_text

print(f"Total questões extraídas da prova: {len(exam_questions)}")

# 3. Carregar questões do banco de dados (USP-SP 2021)
files = [f for f in glob.glob('data/*_final_questions.json') if 'all_homologated' not in f]
db_questions = []
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = q.get('institution', '')
        yr = q.get('year', '')
        if any(k in inst.upper() for k in ['USP', 'FMUSP', 'HCFMUSP']) and not any(k in inst.upper() for k in ['RP', 'RIBEIR']):
            if yr == 2021:
                db_questions.append({
                    'file': fpath,
                    'id': q.get('id'),
                    'code': q.get('code'),
                    'statement': q.get('statement', ''),
                    'options': q.get('options', []),
                    'raw_q': q
                })

print(f"Total questões USP-SP 2021 no banco: {len(db_questions)}")

def normalize(txt):
    txt = txt.lower()
    txt = re.sub(r'[^a-z0-9]', '', txt)
    return txt

matched = []
unmatched = []

for db_q in db_questions:
    stmt_norm = normalize(db_q['statement'][:100])
    best_q_num = None
    best_score = 0
    
    for q_num, ex_txt in exam_questions.items():
        ex_norm = normalize(ex_txt[:250])
        if stmt_norm[:35] in ex_norm or ex_norm[:35] in stmt_norm:
            best_q_num = q_num
            break
        words_db = set(re.findall(r'\w{4,}', db_q['statement'].lower()))
        words_ex = set(re.findall(r'\w{4,}', ex_txt.lower()))
        if words_db:
            common = len(words_db.intersection(words_ex)) / len(words_db)
            if common > best_score and common > 0.40:
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

with open('data/official_exams/USP_FUVEST/usp_2021_matches.json', 'w', encoding='utf-8') as f:
    json.dump({
        'matched': matched,
        'unmatched_count': len(unmatched),
        'total_db': len(db_questions)
    }, f, indent=2, ensure_ascii=False)

print("Mapeamento salvo em data/official_exams/USP_FUVEST/usp_2021_matches.json")
