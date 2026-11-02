import json
import sqlite3
import os
import re
import sys
from collections import Counter

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def normalize_text(text):
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'[\s\r\n\t]+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

print("="*80)
print("🔬 DIAGNÓSTICO FORENSE AVANÇADO: ANÁLISE DE DIVERGÊNCIAS E GABARITOS AUSENTES")
print("="*80)

# Carregar relatório anterior
with open(os.path.join(DATA_DIR, 'relatorio_auditoria_profunda_completa.json'), 'r', encoding='utf-8') as f:
    report = json.load(f)

# Carregar todas as questões do banco
QUESTION_FILES = [
    ('cirurgia', 'Cirurgia', os.path.join(DATA_DIR, 'cirurgia_final_questions.json')),
    ('clinica_medica', 'Clínica Médica', os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')),
    ('ginecologia', 'Ginecologia', os.path.join(DATA_DIR, 'ginecologia_final_questions.json')),
    ('medicina_preventiva', 'Medicina Preventiva e Social', os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json')),
    ('obstetricia', 'Obstetrícia', os.path.join(DATA_DIR, 'obstetricia_final_questions.json')),
    ('pediatria', 'Pediatria', os.path.join(DATA_DIR, 'pediatria_final_questions.json')),
    ('urologia', 'Urologia', os.path.join(DATA_DIR, 'urologia_final_questions.json')),
    ('nefrologia', 'Nefrologia', os.path.join(DATA_DIR, 'nefrologia_final_questions.json')),
]

all_bank_questions = {}
for key, name, fpath in QUESTION_FILES:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            for q in json.load(f):
                if q.get('id'):
                    q['_spec'] = name
                    all_bank_questions[q['id']] = q

# 1. ANALISAR AS DIVERGÊNCIAS COM PROVADERESIDENCIA (3.730 casos)
pdr_path = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
pdr_con = sqlite3.connect(pdr_path)
pdr_cur = pdr_con.cursor()

pdr_matches_map = {}
for qid, pdr_ans, pdr_qid in pdr_cur.execute("SELECT questao_banco_id, gabarito, questao_provaderesidencia_id FROM matches_banco;").fetchall():
    pdr_matches_map[qid] = {'gabarito': pdr_ans, 'pdr_qid': pdr_qid}

# Carregar opções das questões de provaderesidencia para checar permutação de caderno
print("\n🔍 Analisando as 3.730 divergências com ProvaDeResidencia...")
pdr_scramble_count = 0
pdr_real_conflict_count = 0
pdr_anulada_conflict = 0
pdr_samples = []

for qid, pdata in pdr_matches_map.items():
    if qid not in all_bank_questions:
        continue
    q = all_bank_questions[qid]
    b_ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    p_ans = (pdata['gabarito'] or '').strip().upper()
    b_is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or b_ans == 'ANULADA')
    
    if not p_ans or not b_ans:
        continue
        
    if b_ans != p_ans:
        # Se um é anulada e o outro não
        if b_is_anul or b_ans == 'ANULADA' or p_ans == 'ANULADA' or p_ans == 'X':
            pdr_anulada_conflict += 1
            continue
            
        # Buscar texto da alternativa em provaderesidencia
        pdr_row = pdr_cur.execute("SELECT opcoes_json FROM questoes WHERE id = ?;", (pdata['pdr_qid'],)).fetchone()
        is_scramble = False
        matched_letter = None
        
        if pdr_row and pdr_row[0]:
            try:
                p_opts = json.loads(pdr_row[0])
                # p_opts pode ser dict ou list
                p_text_ans = ''
                if isinstance(p_opts, list):
                    for po in p_opts:
                        if po.get('letter') == p_ans or po.get('letra') == p_ans:
                            p_text_ans = normalize_text(po.get('text') or po.get('texto') or '')
                elif isinstance(p_opts, dict):
                    p_text_ans = normalize_text(p_opts.get(p_ans, ''))
                    
                if p_text_ans:
                    for bo in q.get('options', []):
                        b_text = normalize_text(bo.get('text', ''))
                        if b_text and (b_text == p_text_ans or (len(b_text) > 20 and (b_text in p_text_ans or p_text_ans in b_text))):
                            is_scramble = True
                            matched_letter = bo.get('letter')
                            break
            except:
                pass
                
        if is_scramble:
            pdr_scramble_count += 1
            if len(pdr_samples) < 5:
                pdr_samples.append({
                    'id': qid,
                    'code': q.get('code'),
                    'bank_ans': b_ans,
                    'pdr_ans': p_ans,
                    'real_letter_in_bank': matched_letter,
                    'type': 'PERMUTACAO_DE_CADERNO'
                })
        else:
            pdr_real_conflict_count += 1
            if len(pdr_samples) < 10:
                pdr_samples.append({
                    'id': qid,
                    'code': q.get('code'),
                    'bank_ans': b_ans,
                    'pdr_ans': p_ans,
                    'type': 'CONFLITO_REAL_DE_GABARITO'
                })

print(f"   • Permutações de caderno (Booklet Scramble) identificadas: {pdr_scramble_count:,}")
print(f"   • Conflitos reais de gabarito (Banca divergente / Preliminar vs Definitivo): {pdr_real_conflict_count:,}")
print(f"   • Conflitos de anulação: {pdr_anulada_conflict:,}")
print(f"   • Amostras: {json.dumps(pdr_samples[:4], indent=2)}")

# 2. RECUPERAÇÃO DAS 19.964 QUESTÕES SEM GABARITO
print("\n" + "="*80)
print("🔍 Verificando capacidade de recuperação das 19.964 questões sem gabarito...")
missing_qids = [m['id'] for m in report.get('camada6_missing_ans', [])]
recoverable_pdr = 0
recoverable_qm = 0
recoverable_drive = 0

qm_path = os.path.join(DATA_DIR, 'questmed_extracted_exams.db')
qm_con = sqlite3.connect(qm_path)
qm_cur = qm_con.cursor()
qm_map = {r[0]: r[1] for r in qm_cur.execute("SELECT matched_bank_qid, gabarito FROM questmed_questions WHERE matched_bank_qid IS NOT NULL;").fetchall()}

drive_gold_path = os.path.join(DATA_DIR, 'drive_thematic_homologated_gold.json')
drive_map = {}
if os.path.exists(drive_gold_path):
    with open(drive_gold_path, 'r', encoding='utf-8') as f:
        for item in json.load(f):
            if item.get('id') and item.get('official_answer'):
                drive_map[item['id']] = item['official_answer']

# MedBrave corrigido
mb_path = os.path.join(DATA_DIR, 'medbrave_questions_clean.json')
mb_hash_map = {}
if os.path.exists(mb_path):
    with open(mb_path, 'r', encoding='utf-8') as f:
        for item in json.load(f):
            stmt = item.get('statement') or ''
            let = item.get('correct_letter')
            norm = normalize_text(stmt)[:100]
            if len(norm) >= 30 and let:
                mb_hash_map[norm] = {'letter': let, 'is_annulled': item.get('is_annulled'), 'item': item}

recoverable_mb = 0
recovered_total = 0

for qid in missing_qids:
    q = all_bank_questions.get(qid)
    if not q:
        continue
    p_ans = pdr_matches_map.get(qid, {}).get('gabarito')
    q_ans = qm_map.get(qid)
    d_ans = drive_map.get(qid)
    
    norm = normalize_text(q.get('statement') or '')[:100]
    m_info = mb_hash_map.get(norm)
    
    found = False
    if p_ans:
        recoverable_pdr += 1
        found = True
    elif q_ans:
        recoverable_qm += 1
        found = True
    elif d_ans:
        recoverable_drive += 1
        found = True
    elif m_info:
        recoverable_mb += 1
        found = True
        
    if found:
        recovered_total += 1

print(f"   • Total de questões sem gabarito: {len(missing_qids):,}")
print(f"   • Recuperáveis via ProvaDeResidencia: {recoverable_pdr:,}")
print(f"   • Recuperáveis via QuestMed: {recoverable_qm:,}")
print(f"   • Recuperáveis via Livros do Drive: {recoverable_drive:,}")
print(f"   • Recuperáveis via MedBrave: {recoverable_mb:,}")
print(f"   • TOTAL RECUPERÁVEL IMEDIATAMENTE: {recovered_total:,} de {len(missing_qids):,} ({recovered_total/len(missing_qids)*100:.1f}%)")

# 3. AUDITORIA RESIDUAL COMPLETA DO MEDBRAVE COM CHAVES CORRETAS
print("\n" + "="*80)
print("🔍 Re-executando auditoria do MedBrave com chaves corretas (correct_letter / alternatives)...")
mb_exact = 0
mb_divergences = []
mb_scrambles = []
mb_anuladas = []

for qid, q in all_bank_questions.items():
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    norm = normalize_text(q.get('statement') or '')[:100]
    
    if len(norm) < 30:
        continue
        
    m_info = mb_hash_map.get(norm)
    if not m_info:
        continue
        
    m_let = (m_info['letter'] or '').strip().upper()
    m_is_anul = bool(m_info['is_annulled'] or m_let == 'ANULADA')
    
    if m_is_anul and not is_anul:
        mb_anuladas.append({'id': qid, 'code': q.get('code'), 'spec': q['_spec'], 'type': 'MEDBRAVE_ANULADA_BANCO_ATIVO'})
    elif not m_is_anul and is_anul:
        mb_anuladas.append({'id': qid, 'code': q.get('code'), 'spec': q['_spec'], 'type': 'BANCO_ANULADA_MEDBRAVE_ATIVO'})
    elif not is_anul and not m_is_anul and ans and m_let:
        if ans == m_let:
            mb_exact += 1
        else:
            # Checar se é permutação de caderno
            m_item = m_info['item']
            m_opts = {o.get('letter'): normalize_text(o.get('text', '')) for o in m_item.get('alternatives', [])}
            b_opts = {o.get('letter'): normalize_text(o.get('text', '')) for o in q.get('options', [])}
            
            m_ans_text = m_opts.get(m_let, '')
            is_scramble = False
            real_letter = None
            if m_ans_text:
                for bl, bt in b_opts.items():
                    if bt and (bt == m_ans_text or (len(bt) > 20 and (bt in m_ans_text or m_ans_text in bt))):
                        is_scramble = True
                        real_letter = bl
                        break
                        
            if is_scramble:
                mb_scrambles.append({
                    'id': qid,
                    'code': q.get('code'),
                    'spec': q['_spec'],
                    'bank_ans': ans,
                    'mb_ans': m_let,
                    'real_letter': real_letter
                })
            else:
                mb_divergences.append({
                    'id': qid,
                    'code': q.get('code'),
                    'spec': q['_spec'],
                    'bank_ans': ans,
                    'mb_ans': m_let
                })

print(f"   • Total de Matches exatos com MedBrave: {mb_exact:,}")
print(f"   • Permutações de caderno residuais detectadas: {len(mb_scrambles):,}")
print(f"   • Conflitos reais de gabarito com MedBrave: {len(mb_divergences):,}")
print(f"   • Conflitos de anulação com MedBrave: {len(mb_anuladas):,}")

# 4. ANÁLISE DOS 848 COMENTÁRIOS COM ERRO DE BANCA
print("\n" + "="*80)
print("🔍 Análise dos 848 comentários com alertas explícitos de erro da banca...")
banca_error_samples = []
for item in report.get('camada1_com_suspect_alerts', [])[:8]:
    banca_error_samples.append({
        'code': item['code'],
        'spec': item['spec'],
        'ans': item['ans'],
        'snippet': item['snippet']
    })
print(f"   • Amostras de Erros de Banca apontados pelos Professores:")
for s in banca_error_samples:
    print(f"     [{s['code']}] Gabarito: {s['ans']} -> {s['snippet']}")

pdr_con.close()
qm_con.close()

