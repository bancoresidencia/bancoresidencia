import json
import sqlite3
import os
import re
import sys
from collections import Counter, defaultdict

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
print("🧪 SIMULAÇÃO DE HARMONIZAÇÃO DE CADERNOS E ANULAÇÕES COMPROVADAS")
print("="*80)

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

# Carregar quarentena
quar_set = set()
quar_path = os.path.join(DATA_DIR, 'quarentena_questions.json')
if os.path.exists(quar_path):
    with open(quar_path, 'r', encoding='utf-8') as f:
        quar_set = {q['id'] for q in json.load(f) if 'id' in q}

all_bank_questions = {}
for key, name, fpath in QUESTION_FILES:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            for q in json.load(f):
                if q.get('id'):
                    q['_spec'] = name
                    q['_file'] = fpath
                    all_bank_questions[q['id']] = q

print(f"📦 Total de questões no banco: {len(all_bank_questions):,}")
print(f"🛡️ Quarentena ativa: {len(quar_set):,}")

# 1. IDENTIFICAR ANULAÇÕES COMPROVADAS
# A) MedBrave
mb_path = os.path.join(DATA_DIR, 'medbrave_questions_clean.json')
mb_hash_map = {}
if os.path.exists(mb_path):
    with open(mb_path, 'r', encoding='utf-8') as f:
        for item in json.load(f):
            stmt = item.get('statement') or ''
            let = item.get('correct_letter')
            norm = normalize_text(stmt)[:100]
            if len(norm) >= 30:
                mb_hash_map[norm] = item

to_anulate = {}

for qid, q in all_bank_questions.items():
    if qid in quar_set:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    if is_anul:
        continue
        
    norm = normalize_text(q.get('statement') or '')[:100]
    mb_item = mb_hash_map.get(norm)
    if mb_item:
        mb_is_anul = bool(mb_item.get('is_annulled') or mb_item.get('correct_letter') == 'ANULADA')
        if mb_is_anul:
            to_anulate[qid] = {
                'id': qid,
                'code': q.get('code'),
                'spec': q['_spec'],
                'source': 'MEDBRAVE_ANULACAO_OFICIAL',
                'old_answer': ans
            }

# B) ProvaDeResidencia Anulações
pdr_path = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
if os.path.exists(pdr_path):
    con = sqlite3.connect(pdr_path)
    cur = con.cursor()
    rows = cur.execute("SELECT m.questao_banco_id, q.is_anulada, q.gabarito_oficial FROM matches_banco m JOIN questoes q ON m.questao_provaderesidencia_id = q.id;").fetchall()
    for qid, p_is_anul, p_gab in rows:
        if qid not in all_bank_questions or qid in quar_set:
            continue
        q = all_bank_questions[qid]
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
        if is_anul:
            continue
        if p_is_anul or (p_gab and p_gab.upper() in ['ANULADA', 'X']):
            to_anulate[qid] = {
                'id': qid,
                'code': q.get('code'),
                'spec': q['_spec'],
                'source': 'PROVADERESIDENCIA_ANULACAO_OFICIAL',
                'old_answer': ans
            }
    con.close()

print(f"\n❌ Total de questões para homologação de ANULAÇÃO OFICIAL: {len(to_anulate):,}")

# 2. IDENTIFICAR PERMUTAÇÕES DE CADERNO (BOOKLET SCRAMBLES)
to_scramble_fix = {}

# A) ProvaDeResidencia Booklet Scrambles
if os.path.exists(pdr_path):
    con = sqlite3.connect(pdr_path)
    cur = con.cursor()
    rows = cur.execute("SELECT m.questao_banco_id, m.gabarito, q.opcoes_json FROM matches_banco m JOIN questoes q ON m.questao_provaderesidencia_id = q.id;").fetchall()
    for qid, p_ans, p_opts_json in rows:
        if qid not in all_bank_questions or qid in quar_set or qid in to_anulate:
            continue
        q = all_bank_questions[qid]
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        p_ans = (p_ans or '').strip().upper()
        if not ans or not p_ans or ans == p_ans or ans == 'ANULADA' or p_ans == 'ANULADA':
            continue
            
        # Obter texto da opção correta no caderno do ProvaDeResidência
        p_text = ''
        if p_opts_json:
            try:
                opts = json.loads(p_opts_json)
                if isinstance(opts, list):
                    for po in opts:
                        if (po.get('letter') or po.get('letra') or '').upper() == p_ans:
                            p_text = normalize_text(po.get('text') or po.get('texto') or '')
                elif isinstance(opts, dict):
                    p_text = normalize_text(opts.get(p_ans, ''))
            except:
                pass
                
        if p_text:
            for bo in q.get('options', []):
                b_text = normalize_text(bo.get('text', ''))
                b_letter = (bo.get('letter') or '').upper()
                if b_text and b_letter in ['A','B','C','D','E'] and b_letter != ans:
                    if b_text == p_text or (len(b_text) > 20 and (b_text in p_text or p_text in b_text)):
                        to_scramble_fix[qid] = {
                            'id': qid,
                            'code': q.get('code'),
                            'spec': q['_spec'],
                            'old_letter': ans,
                            'new_letter': b_letter,
                            'source': 'PROVADERESIDENCIA_BOOKLET_SCRAMBLE'
                        }
                        break
    con.close()

# B) MedBrave Booklet Scrambles
for qid, q in all_bank_questions.items():
    if qid in quar_set or qid in to_anulate or qid in to_scramble_fix:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    if not ans or ans == 'ANULADA':
        continue
    norm = normalize_text(q.get('statement') or '')[:100]
    if len(norm) < 30:
        continue
    mb_item = mb_hash_map.get(norm)
    if not mb_item:
        continue
    m_let = (mb_item.get('correct_letter') or '').strip().upper()
    if not m_let or m_let == ans or m_let == 'ANULADA':
        continue
        
    m_opts = {o.get('letter'): normalize_text(o.get('text', '')) for o in mb_item.get('alternatives', [])}
    m_ans_text = m_opts.get(m_let, '')
    if m_ans_text:
        for bo in q.get('options', []):
            b_text = normalize_text(bo.get('text', ''))
            b_letter = (bo.get('letter') or '').upper()
            if b_text and b_letter in ['A','B','C','D','E'] and b_letter != ans:
                if b_text == m_ans_text or (len(b_text) > 20 and (b_text in m_ans_text or m_ans_text in b_text)):
                    to_scramble_fix[qid] = {
                        'id': qid,
                        'code': q.get('code'),
                        'spec': q['_spec'],
                        'old_letter': ans,
                        'new_letter': b_letter,
                        'source': 'MEDBRAVE_BOOKLET_SCRAMBLE'
                    }
                    break

print(f"🔄 Total de questões para CORREÇÃO DE PERMUTAÇÃO DE CADERNO: {len(to_scramble_fix):,}")

# 3. RECUPERAÇÃO DAS QUESTÕES SEM GABARITO (402 casos com gabarito oficial provado)
to_recover_unhomologated = {}
for qid, q in all_bank_questions.items():
    if qid in quar_set or qid in to_anulate or qid in to_scramble_fix:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    if ans or is_anul:
        continue
        
    norm = normalize_text(q.get('statement') or '')[:100]
    mb_item = mb_hash_map.get(norm)
    if mb_item:
        m_let = (mb_item.get('correct_letter') or '').strip().upper()
        if m_let in ['A','B','C','D','E']:
            # Verificar se a opção no MedBrave bate com alguma opção no banco
            m_opts = {o.get('letter'): normalize_text(o.get('text', '')) for o in mb_item.get('alternatives', [])}
            m_ans_text = m_opts.get(m_let, '')
            if m_ans_text:
                for bo in q.get('options', []):
                    b_text = normalize_text(bo.get('text', ''))
                    b_letter = (bo.get('letter') or '').upper()
                    if b_text and (b_text == m_ans_text or (len(b_text) > 20 and (b_text in m_ans_text or m_ans_text in b_text))):
                        to_recover_unhomologated[qid] = {
                            'id': qid,
                            'code': q.get('code'),
                            'spec': q['_spec'],
                            'recovered_letter': b_letter,
                            'source': 'MEDBRAVE_RECOVERED'
                        }
                        break

print(f"✨ Total de questões sem gabarito com GABARITO OFICIAL RECUPERADO: {len(to_recover_unhomologated):,}")

# Contagem por especialidade
print("\nDistribuição das ações por especialidade:")
spec_summary = defaultdict(lambda: {'anulada': 0, 'scramble': 0, 'recovered': 0})
for item in to_anulate.values():
    spec_summary[item['spec']]['anulada'] += 1
for item in to_scramble_fix.values():
    spec_summary[item['spec']]['scramble'] += 1
for item in to_recover_unhomologated.values():
    spec_summary[item['spec']]['recovered'] += 1

for spec, counts in spec_summary.items():
    print(f"   • {spec.ljust(30)}: Scrambles: {counts['scramble']:4d} | Anulações: {counts['anulada']:3d} | Recuperadas: {counts['recovered']:3d}")

# Salvar manifesto de execução
manifest = {
    'to_anulate': list(to_anulate.values()),
    'to_scramble_fix': list(to_scramble_fix.values()),
    'to_recover_unhomologated': list(to_recover_unhomologated.values())
}
manifest_path = os.path.join(DATA_DIR, 'manifesto_harmonizacao_e_anulacoes.json')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print(f"\n📄 Manifesto salvo com sucesso em: {manifest_path}")

