import json, glob, re, sys, pypdf
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 80)
print("RESOLUÇÃO E HOMOLOGAÇÃO: SANTA CASA DE SÃO PAULO 2019")
print("=" * 80)

# 1. Read gabarito definitivo
gab_pdf = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2019_GABARITO_DEFINITIVO_CID1324.pdf'
gab_reader = pypdf.PdfReader(gab_pdf)
gab_text = gab_reader.pages[0].extract_text()

# In page 1:
# PROGRAMAS COM ACESSO DIRETO
# 1..25: D C E E D A B B D A B C E D A E D E B A D A C D B
# 26..50: D A B D E A B D A C E E D C A A D E B D B E C D A
# 51..75: D C A D A E B C X B D B B E C D A C B C A C X D C
# 76..100: D E B D E C E A B E B C B C A X E B C A B E B C A
# Questões 59, 73 e 91: anuladas (representadas por X)

r1 = "D C E E D A B B D A B C E D A E D E B A D A C D B".split()
r2 = "D A B D E A B D A C E E D C A A D E B D B E C D A".split()
r3 = "D C A D A E B C X B D B B E C D A C B C A C X D C".split()
r4 = "D E B D E C E A B E B C B C A X E B C A B E B C A".split()
sc_2019_keys = r1 + r2 + r3 + r4
print(f"Total chaves oficiais SC 2019: {len(sc_2019_keys)}")

# 2. Read exam questions from exam PDF
exam_pdf = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2019_PV_ACESSO_DIRETO_CID1324.pdf'
exam_reader = pypdf.PdfReader(exam_pdf)
exam_text = ""
for p in exam_reader.pages:
    exam_text += p.extract_text() + "\n"

print(f"Texto da prova extraído: {len(exam_text):,} caracteres")

parts = re.split(r'\bQUEST[ÃA]O\s+(\d+)\b', exam_text, flags=re.I)
print(f"Partes encontradas na prova: {len(parts)}")

official_questions = {}
for i in range(1, len(parts), 2):
    q_num = int(parts[i])
    q_raw = parts[i+1].strip()
    alt_matches = list(re.finditer(r'\(([A-E])\)\s*', q_raw))
    if alt_matches:
        stmt_text = q_raw[:alt_matches[0].start()].strip()
        alts = {}
        for idx, m in enumerate(alt_matches):
            letter = m.group(1)
            start_pos = m.end()
            end_pos = alt_matches[idx+1].start() if idx+1 < len(alt_matches) else len(q_raw)
            alts[letter] = q_raw[start_pos:end_pos].strip()
    else:
        stmt_text = q_raw
        alts = {}
        
    official_questions[q_num] = {
        'num': q_num,
        'key': sc_2019_keys[q_num-1],
        'stmt': stmt_text,
        'alts': alts,
    }

print(f"Questões oficiais identificadas: {len(official_questions)}/100")

def norm(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-zA-Z0-9áéíóúãõçÁÉÍÓÚÃÕÇ]', '', str(t)).lower())

# 3. Load DB questions for Santa Casa 2019
files = sorted(glob.glob('data/*_final_questions.json'))
db_questions = []
file_map = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    file_map[f] = qs
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        if ('santa casa de são paulo' in inst.lower() or 'iscmsp' in inst.lower()) and yr == 2019:
            q['_file'] = f
            db_questions.append(q)

print(f"Total questões no banco para Santa Casa 2019: {len(db_questions)}")

# Match scoring
candidates = []
for q in db_questions:
    q_id = q['id']
    q_stmt_norm = norm(q.get('statement', '')[:200])
    q_alts = {opt.get('letter'): norm(opt.get('text', '')[:100]) for opt in q.get('options', [])}
    
    for q_num, off in official_questions.items():
        off_stmt_norm = norm(off['stmt'][:200])
        if not q_stmt_norm or not off_stmt_norm:
            continue
        score = 0.0
        if q_stmt_norm[:60] == off_stmt_norm[:60]:
            score += 0.7
        else:
            sim_stmt = SequenceMatcher(None, q_stmt_norm[:100], off_stmt_norm[:100]).ratio()
            score += sim_stmt * 0.7
            
        off_alts = {k: norm(v[:100]) for k, v in off['alts'].items()}
        alt_matches = 0
        for ltr in ['A', 'B', 'C', 'D', 'E']:
            if ltr in q_alts and ltr in off_alts:
                if q_alts[ltr][:40] and off_alts[ltr][:40] and (q_alts[ltr][:40] == off_alts[ltr][:40]):
                    alt_matches += 1
        score += (alt_matches / 5.0) * 0.3
        candidates.append((score, q_id, q_num, q, off))

candidates.sort(key=lambda x: x[0], reverse=True)
final_match = {}
used_qnums = set()
for score, q_id, q_num, q, off in candidates:
    if q_id not in final_match and q_num not in used_qnums:
        if score > 0.45:
            final_match[q_id] = (q_num, off['key'], score, q, off)
            used_qnums.add(q_num)

print(f"\nFinal Matched: {len(final_match)}/{len(db_questions)} questões!")
print(f"Números únicos casados: {len(used_qnums)}/100")

# Update questions
updated_count = 0
anuladas_count = 0

for f, qs in file_map.items():
    file_modified = False
    for q in qs:
        q_id = q.get('id')
        if q_id in final_match:
            q_num, off_key, score, _, off = final_match[q_id]
            is_anulada = (off_key == 'X')
            
            if is_anulada:
                q['is_anulada'] = True
                q['isAnulada'] = True
                q['correct_answer'] = 'ANULADA'
                q['correctAnswer'] = 'ANULADA'
                anuladas_count += 1
            else:
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['correct_answer'] = off_key
                q['correctAnswer'] = off_key
                
            q['official_source'] = 'Instituto Quadrix - Concurso Seleção Médicos Residentes ISCMSP 2019'
            q['official_audit'] = {
                'verified': True,
                'exam': 'ISCMSP 2019 - Programas com Acesso Direto',
                'question_number': q_num,
                'official_key': off_key,
                'banca': 'Instituto Quadrix',
                'document': 'GABARITO DEFINITIVO - PROVA OBJETIVA (10/12/2018)',
                'source_url': 'https://quadrix.org.br/uploads/861/concursos/1324/anexos/6e9e4c9e1ce56c2efdcd39f830fe3815.pdf'
            }
            file_modified = True
            updated_count += 1
            
    if file_modified:
        print(f"Salvando alterações em {f}...")
        with open(f, 'w', encoding='utf-8') as fp:
            json.dump(qs, fp, ensure_ascii=False, indent=2)

print(f"\n✅ Total atualizado SC 2019: {updated_count} questões.")
print(f"   • Alternativas oficiais: {updated_count - anuladas_count}")
print(f"   • Anuladas oficiais: {anuladas_count}")

# Update Gold
gold_file = 'data/all_homologated_questions_gold.json'
with open(gold_file, 'r', encoding='utf-8') as fp:
    gold_qs = json.load(fp)

gold_dict = {q['id']: q for q in gold_qs}
initial_gold_len = len(gold_dict)

for q_id, (q_num, off_key, score, q_db, off) in final_match.items():
    is_anulada = (off_key == 'X')
    q_entry = dict(q_db)
    q_entry.pop('_file', None)
    if is_anulada:
        q_entry['is_anulada'] = True
        q_entry['isAnulada'] = True
        q_entry['correct_answer'] = 'ANULADA'
        q_entry['correctAnswer'] = 'ANULADA'
    else:
        q_entry['is_anulada'] = False
        q_entry['isAnulada'] = False
        q_entry['correct_answer'] = off_key
        q_entry['correctAnswer'] = off_key
        
    q_entry['official_source'] = 'Instituto Quadrix - Concurso Seleção Médicos Residentes ISCMSP 2019'
    q_entry['official_audit'] = {
        'verified': True,
        'exam': 'ISCMSP 2019 - Programas com Acesso Direto',
        'question_number': q_num,
        'official_key': off_key,
        'banca': 'Instituto Quadrix',
        'document': 'GABARITO DEFINITIVO - PROVA OBJETIVA (10/12/2018)',
        'source_url': 'https://quadrix.org.br/uploads/861/concursos/1324/anexos/6e9e4c9e1ce56c2efdcd39f830fe3815.pdf'
    }
    gold_dict[q_id] = q_entry

print(f"Manifesto Ouro atualizado: {initial_gold_len} -> {len(gold_dict)} questões (+{len(gold_dict) - initial_gold_len} novas).")
with open(gold_file, 'w', encoding='utf-8') as fp:
    json.dump(list(gold_dict.values()), fp, ensure_ascii=False, indent=2)

print("=" * 80)
print("SANTA CASA 2019: CONCLUÍDO COM SUCESSO!")
print("=" * 80)
