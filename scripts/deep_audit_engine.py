import json
import sqlite3
import os
import re
import sys
from collections import defaultdict

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

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

def normalize_text(text):
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'[\s\r\n\t]+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

print("="*80)
print("🔍 INICIANDO AUDITORIA FORENSE MULTICAMADA DE GABARITOS NO BANCO DE QUESTÕES")
print("="*80)

# 1. Carregar todas as questões do banco
all_bank_questions = {}
spec_counts = {}

for key, name, fpath in QUESTION_FILES:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        spec_counts[name] = len(data)
        for q in data:
            qid = q.get('id')
            if qid:
                q['_spec_name'] = name
                q['_spec_key'] = key
                all_bank_questions[qid] = q

print(f"📦 Total de questões carregadas do banco ativo: {len(all_bank_questions)}")
for sname, scnt in spec_counts.items():
    print(f"   • {sname.ljust(30)}: {scnt:,} questões")

# Carregar quarentena
quar_set = set()
quar_path = os.path.join(DATA_DIR, 'quarentena_questions.json')
if os.path.exists(quar_path):
    with open(quar_path, 'r', encoding='utf-8') as f:
        quar_list = json.load(f)
        quar_set = {q['id'] for q in quar_list if 'id' in q}
print(f"🛡️ Total de questões em quarentena prévia: {len(quar_set):,}")

# ---------------------------------------------------------
# CAMADA 1: AUDITORIA INTERNA (COMENTÁRIO vs GABARITO)
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 1: Auditoria Interna (Comentário vs Gabarito Homologado)")
print("-"*60)

com_divergences = []
com_suspect_alerts = []

# Regex para gabarito explícito no comentário
# Ex: "Gabarito: A", "Gabarito Oficial: Alternativa B", "Resposta: C", "GABARITO: D"
re_gab = re.compile(r'(?:Gabarito(?:\s*Oficial)?|Resposta(?:\s*Correta)?):\s*(?:Alternativa\s*)?([A-E]|ANULADA)\b', re.IGNORECASE)

for qid, q in all_bank_questions.items():
    if qid in quar_set:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    comm = q.get('commentary') or ''
    
    if not comm:
        continue
        
    # Alerta de erro da banca no comentário
    if '[POSSÍVEL ERRO DE GABARITO' in comm or 'POSSIVEL ERRO DE GABARITO' in comm or 'GABARITO DA BANCA DIVERGENTE' in comm:
        com_suspect_alerts.append({
            'id': qid,
            'code': q.get('code'),
            'spec': q['_spec_name'],
            'ans': ans,
            'snippet': comm[:120].replace('\n', ' ')
        })
        
    m = re_gab.search(comm)
    if m:
        com_ans = m.group(1).upper()
        if not is_anul and ans in ['A','B','C','D','E'] and com_ans in ['A','B','C','D','E']:
            if com_ans != ans:
                # Verificar se o comentário não está apenas discutindo um gabarito preliminar retificado
                # Ex: "Gabarito preliminar A, mas a banca alterou para B"
                is_discussion = bool(re.search(r'preliminar|recurso|alterad[ao]|mudou', comm[:m.end()+60], re.IGNORECASE))
                com_divergences.append({
                    'id': qid,
                    'code': q.get('code'),
                    'spec': q['_spec_name'],
                    'bank_answer': ans,
                    'comment_answer': com_ans,
                    'has_recurso_discussion': is_discussion,
                    'context': comm[max(0, m.start()-20):min(len(comm), m.end()+60)].replace('\n', ' ')
                })

print(f"   • Questões com menção explícita de Erro da Banca no comentário: {len(com_suspect_alerts)}")
print(f"   • Divergências diretas entre Gabarito do Comentário e correct_answer: {len(com_divergences)}")

# ---------------------------------------------------------
# CAMADA 2: AUDITORIA CONTRA PROVADERESIDENCIA_COLETA.DB
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 2: Auditoria contra provaderesidencia_coleta.db (matches_banco)")
print("-"*60)

pdr_path = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
pdr_divergences = []
pdr_exact_matches = 0
pdr_booklet_scrambles = []

if os.path.exists(pdr_path):
    con = sqlite3.connect(pdr_path)
    cur = con.cursor()
    # Buscar todos os matches_banco
    rows = cur.execute("SELECT questao_banco_id, gabarito, numero_questao, instituicao, ano FROM matches_banco;").fetchall()
    print(f"   • Total de registros em matches_banco: {len(rows):,}")
    
    for qid, pdr_ans, num, inst, ano in rows:
        if qid not in all_bank_questions:
            continue
        if qid in quar_set:
            continue
            
        q = all_bank_questions[qid]
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        pdr_ans = (pdr_ans or '').strip().upper()
        
        if not pdr_ans or not ans:
            continue
            
        if ans == pdr_ans:
            pdr_exact_matches += 1
        else:
            pdr_divergences.append({
                'id': qid,
                'code': q.get('code'),
                'spec': q['_spec_name'],
                'bank_ans': ans,
                'pdr_ans': pdr_ans,
                'inst': inst or q.get('institution') or q.get('banca'),
                'ano': ano or q.get('year')
            })
    con.close()
    print(f"   • Matches exatos com ProvaDeResidencia: {pdr_exact_matches:,}")
    print(f"   • Divergências com ProvaDeResidencia: {len(pdr_divergences):,}")

# ---------------------------------------------------------
# CAMADA 3: AUDITORIA CONTRA QUESTMED_EXTRACTED_EXAMS.DB
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 3: Auditoria contra questmed_extracted_exams.db")
print("-"*60)

qm_path = os.path.join(DATA_DIR, 'questmed_extracted_exams.db')
qm_exact_matches = 0
qm_divergences = []

if os.path.exists(qm_path):
    con = sqlite3.connect(qm_path)
    cur = con.cursor()
    rows = cur.execute("SELECT matched_bank_qid, gabarito, banca, ano, numero FROM questmed_questions WHERE matched_bank_qid IS NOT NULL;").fetchall()
    print(f"   • Total de registros mapeados no QuestMed: {len(rows):,}")
    
    for qid, qm_ans, banca, ano, num in rows:
        if qid not in all_bank_questions or qid in quar_set:
            continue
        q = all_bank_questions[qid]
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        qm_ans = (qm_ans or '').strip().upper()
        
        if not qm_ans or not ans:
            continue
            
        if ans == qm_ans:
            qm_exact_matches += 1
        else:
            qm_divergences.append({
                'id': qid,
                'code': q.get('code'),
                'spec': q['_spec_name'],
                'bank_ans': ans,
                'qm_ans': qm_ans,
                'banca': banca,
                'ano': ano
            })
    con.close()
    print(f"   • Matches exatos com QuestMed: {qm_exact_matches:,}")
    print(f"   • Divergências com QuestMed: {len(qm_divergences):,}")

# ---------------------------------------------------------
# CAMADA 4: AUDITORIA CONTRA DRIVE THEMATIC HOMOLOGATED GOLD
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 4: Auditoria contra drive_thematic_homologated_gold.json")
print("-"*60)

drive_gold_path = os.path.join(DATA_DIR, 'drive_thematic_homologated_gold.json')
drive_exact = 0
drive_divergences = []

if os.path.exists(drive_gold_path):
    with open(drive_gold_path, 'r', encoding='utf-8') as f:
        drive_data = json.load(f)
    print(f"   • Total de registros em drive_thematic_homologated_gold: {len(drive_data):,}")
    
    for item in drive_data:
        qid = item.get('id')
        if not qid or qid not in all_bank_questions or qid in quar_set:
            continue
        q = all_bank_questions[qid]
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        gold_ans = (item.get('official_answer') or '').strip().upper()
        
        if not gold_ans or not ans:
            continue
            
        if ans == gold_ans:
            drive_exact += 1
        else:
            drive_divergences.append({
                'id': qid,
                'code': q.get('code'),
                'spec': q['_spec_name'],
                'bank_ans': ans,
                'gold_ans': gold_ans,
                'book': item.get('book')
            })
    print(f"   • Matches exatos com Livros do Drive: {drive_exact:,}")
    print(f"   • Divergências com Livros do Drive: {len(drive_divergences):,}")

# ---------------------------------------------------------
# CAMADA 5: AUDITORIA CONTRA MEDBRAVE RESIDUAL
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 5: Auditoria contra medbrave_questions_clean.json (Residual)")
print("-"*60)

medbrave_path = os.path.join(DATA_DIR, 'medbrave_questions_clean.json')
mb_exact = 0
mb_divergences = []
mb_anuladas_mismatch = []

if os.path.exists(medbrave_path):
    with open(medbrave_path, 'r', encoding='utf-8') as f:
        mb_data = json.load(f)
    print(f"   • Total de registros no MedBrave: {len(mb_data):,}")
    
    # Indexar por id (se houver uuid compartilhado) e por hash de enunciado
    mb_by_id = {}
    mb_by_hash = {}
    for item in mb_data:
        mid = item.get('id')
        if mid:
            mb_by_id[mid] = item
        stmt = item.get('statement') or item.get('enunciado') or ''
        norm = normalize_text(stmt)[:100]
        if len(norm) >= 30:
            mb_by_hash[norm] = item
            
    print(f"   • MedBrave indexado: {len(mb_by_id):,} por ID, {len(mb_by_hash):,} por Enunciado")
    
    for qid, q in all_bank_questions.items():
        if qid in quar_set:
            continue
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
        
        # Tentar match por ID ou por Enunciado
        mb_match = mb_by_id.get(qid)
        if not mb_match:
            stmt = q.get('statement') or ''
            norm = normalize_text(stmt)[:100]
            if len(norm) >= 30:
                mb_match = mb_by_hash.get(norm)
                
        if mb_match:
            mb_ans = (mb_match.get('correctAnswer') or mb_match.get('gabarito') or '').strip().upper()
            mb_is_anul = bool(mb_match.get('isAnulada') or mb_match.get('is_anulada') or mb_ans == 'ANULADA')
            
            if mb_is_anul and not is_anul:
                mb_anuladas_mismatch.append({
                    'id': qid,
                    'code': q.get('code'),
                    'spec': q['_spec_name'],
                    'bank_ans': ans,
                    'mb_ans': 'ANULADA',
                    'reason': 'MEDBRAVE_ANULADA_MAS_BANCO_ATIVO'
                })
            elif not mb_is_anul and is_anul:
                mb_anuladas_mismatch.append({
                    'id': qid,
                    'code': q.get('code'),
                    'spec': q['_spec_name'],
                    'bank_ans': 'ANULADA',
                    'mb_ans': mb_ans,
                    'reason': 'BANCO_ANULADA_MAS_MEDBRAVE_ATIVO'
                })
            elif not is_anul and not mb_is_anul and ans and mb_ans:
                if ans == mb_ans:
                    mb_exact += 1
                else:
                    # Checar se as opções de texto batem (para ver se é permutação de caderno)
                    b_opts = {o['letter']: normalize_text(o['text']) for o in q.get('options', []) if 'letter' in o and 'text' in o}
                    m_opts = {o['letter']: normalize_text(o.get('text') or o.get('texto') or '') for o in mb_match.get('options', []) if 'letter' in o}
                    
                    # Texto da alternativa correta no MedBrave
                    mb_corr_text = m_opts.get(mb_ans, '')
                    bank_corr_text = b_opts.get(ans, '')
                    
                    is_booklet = False
                    real_bank_letter = None
                    if mb_corr_text:
                        for l, t in b_opts.items():
                            if t and (t == mb_corr_text or (len(t) > 20 and (t in mb_corr_text or mb_corr_text in t))):
                                is_booklet = True
                                real_bank_letter = l
                                break
                                
                    mb_divergences.append({
                        'id': qid,
                        'code': q.get('code'),
                        'spec': q['_spec_name'],
                        'bank_ans': ans,
                        'mb_ans': mb_ans,
                        'is_booklet_scramble': is_booklet,
                        'real_bank_letter': real_bank_letter
                    })
                    
    print(f"   • Matches exatos com MedBrave: {mb_exact:,}")
    print(f"   • Divergências de Gabarito com MedBrave: {len(mb_divergences):,}")
    print(f"     -> Destas, permutações de caderno detectadas: {sum(1 for d in mb_divergences if d['is_booklet_scramble']):,}")
    print(f"     -> Discordâncias de conteúdo reais: {sum(1 for d in mb_divergences if not d['is_booklet_scramble']):,}")
    print(f"   • Conflitos de Anulação (Ativo vs Anulado): {len(mb_anuladas_mismatch):,}")

# ---------------------------------------------------------
# CAMADA 6: AUDITORIA ESTRUTURAL
# ---------------------------------------------------------
print("\n" + "-"*60)
print("🔎 CAMADA 6: Auditoria Estrutural e de Opções")
print("-"*60)

missing_ans = []
duplicate_opts = []
short_statements = []

for qid, q in all_bank_questions.items():
    if qid in quar_set:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    stmt = (q.get('statement') or '').strip()
    opts = q.get('options') or []
    
    # 1. Sem resposta e não anulada
    if not is_anul and not ans:
        missing_ans.append({
            'id': qid,
            'code': q.get('code'),
            'spec': q['_spec_name']
        })
        
    # 2. Enunciado extremamente curto
    if len(stmt) < 30 and not is_anul:
        short_statements.append({
            'id': qid,
            'code': q.get('code'),
            'spec': q['_spec_name'],
            'len': len(stmt),
            'text': stmt
        })
        
    # 3. Opções com texto duplicado
    texts = [normalize_text(o.get('text', '')) for o in opts if o.get('text')]
    if len(texts) > 1 and len(set(texts)) < len(texts):
        duplicate_opts.append({
            'id': qid,
            'code': q.get('code'),
            'spec': q['_spec_name'],
            'total_opts': len(texts),
            'unique_opts': len(set(texts))
        })

print(f"   • Questões ativas sem resposta definida: {len(missing_ans)}")
print(f"   • Questões ativas com enunciados suspeitos (< 30 chars): {len(short_statements)}")
print(f"   • Questões com alternativas idênticas duplicadas: {len(duplicate_opts)}")

# ---------------------------------------------------------
# SALVAR RELATÓRIO ESTRUTURADO DE RESULTADOS
# ---------------------------------------------------------
summary = {
    'total_bank_questions': len(all_bank_questions),
    'total_quarantined': len(quar_set),
    'camada1_com_divergences': len(com_divergences),
    'camada1_com_suspect_alerts': len(com_suspect_alerts),
    'camada2_pdr_divergences': len(pdr_divergences),
    'camada3_qm_divergences': len(qm_divergences),
    'camada4_drive_divergences': len(drive_divergences),
    'camada5_mb_divergences': len(mb_divergences),
    'camada5_mb_booklet_scrambles': sum(1 for d in mb_divergences if d['is_booklet_scramble']),
    'camada5_mb_content_discrepancies': sum(1 for d in mb_divergences if not d['is_booklet_scramble']),
    'camada5_mb_anuladas_mismatch': len(mb_anuladas_mismatch),
    'camada6_missing_ans': len(missing_ans),
    'camada6_short_statements': len(short_statements),
    'camada6_duplicate_opts': len(duplicate_opts),
}

report_out = os.path.join(DATA_DIR, 'relatorio_auditoria_profunda_completa.json')
with open(report_out, 'w', encoding='utf-8') as f:
    json.dump({
        'summary': summary,
        'camada1_com_divergences': com_divergences[:200],
        'camada1_com_suspect_alerts': com_suspect_alerts[:200],
        'camada2_pdr_divergences': pdr_divergences[:200],
        'camada3_qm_divergences': qm_divergences[:200],
        'camada4_drive_divergences': drive_divergences[:200],
        'camada5_mb_divergences': mb_divergences[:200],
        'camada5_mb_anuladas_mismatch': mb_anuladas_mismatch[:200],
        'camada6_missing_ans': missing_ans,
        'camada6_short_statements': short_statements,
        'camada6_duplicate_opts': duplicate_opts
    }, f, indent=2)

print("\n" + "="*80)
print(f"📊 RELATÓRIO COMPLETO SALVO EM: {report_out}")
print("="*80)
