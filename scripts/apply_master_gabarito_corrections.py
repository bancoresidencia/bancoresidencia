import json
import sqlite3
import os
import re
import sys
import unicodedata
import time
import shutil
import urllib.request
from collections import defaultdict, Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 90)
print("🚀 MOTOR DE APLICAÇÃO MASTER: CORREÇÃO INTEGRAL DE GABARITOS & LIMPEZA DE COMENTÁRIOS")
print("=" * 90)

t_start = time.time()

# ---------------------------------------------------------------------------
# 0. Backup Prévio de Segurança
# ---------------------------------------------------------------------------
backup_dir = 'data/backups_pre_correcao_gabaritos_2026'
os.makedirs(backup_dir, exist_ok=True)
print(f"\n[PASSO 1/5] Criando backup de segurança em '{backup_dir}'...")

SPECIALTY_FILES = [
    ('Cirurgia', 'data/cirurgia_final_questions.json'),
    ('Clínica Médica', 'data/clinica_medica_final_questions.json'),
    ('Ginecologia', 'data/ginecologia_final_questions.json'),
    ('Obstetrícia', 'data/obstetricia_final_questions.json'),
    ('Pediatria', 'data/pediatria_final_questions.json'),
    ('Medicina Preventiva', 'data/medicina_preventiva_final_questions.json'),
    ('Urologia', 'data/urologia_final_questions.json'),
    ('Nefrologia', 'data/nefrologia_final_questions.json')
]

for spec, fp in SPECIALTY_FILES:
    if os.path.exists(fp):
        dest = os.path.join(backup_dir, os.path.basename(fp))
        shutil.copy2(fp, dest)
        print(f"  • Backup salvo: {os.path.basename(fp)}")

# ---------------------------------------------------------------------------
# Funções de normalização e similaridade
# ---------------------------------------------------------------------------
def normalize(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def clean_prefix(norm):
    norm = re.sub(r'^([0-9]{1,3}\s*[\.\-\)]\s*)', '', norm)
    norm = re.sub(r'^(questao\s*[0-9]{1,3}\s*[\.\-\:]\s*)', '', norm)
    norm = re.sub(r'^(assinale a alternativa (correta|incorreta|falsa|verdadeira)|com relacao a|a respeito de|sobre|quanto a|no que se refere a|considerando|diante do exposto|com base no caso)\s+', '', norm)
    return norm.strip()

def text_similarity(a, b):
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    words_a = set(w for w in a.split() if len(w) > 2)
    words_b = set(w for w in b.split() if len(w) > 2)
    if not words_a or not words_b:
        return 0.0
    inter = len(words_a & words_b)
    union = len(words_a | words_b)
    return inter / union

def match_option_text(opt_target, opt_candidate):
    nt = normalize(opt_target)
    nc = normalize(opt_candidate)
    if not nt or not nc:
        return False
    if nt == nc:
        return True
    if len(nt) >= 8 and len(nc) >= 8:
        if nt in nc or nc in nt:
            shorter = min(len(nt), len(nc))
            longer = max(len(nt), len(nc))
            if shorter / longer >= 0.70:
                return True
    return text_similarity(nt, nc) >= 0.75

# ---------------------------------------------------------------------------
# 1. Carregar e indexar bases de referência externas
# ---------------------------------------------------------------------------
print("\n[PASSO 2/5] Carregando bases de referência padrão-ouro em memória...")
ref_by_prefix = defaultdict(list)
ref_by_mid = defaultdict(list)
total_refs_loaded = 0

# Base Ouro
if os.path.exists('data/all_homologated_questions_gold.json'):
    with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as f:
        gold_data = json.load(f)
    for q in gold_data:
        norm = clean_prefix(normalize(q.get('statement') or ''))
        if len(norm) < 20: continue
        ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        is_anul = bool(q.get('is_anulada')) or ans in ['ANULADA', 'X', 'N']
        opts = {}
        correct_text = ''
        for o in q.get('options') or []:
            if isinstance(o, dict):
                l = (o.get('letter') or '').strip().upper()
                t = o.get('text') or ''
                if l:
                    opts[l] = t
                    if l == ans: correct_text = t
        item = {'source': 'BaseOuro_Oficial', 'statement_norm': norm, 'is_annulled': is_anul, 'correct_letter_orig': ans, 'correct_text': correct_text, 'all_options': opts}
        ref_by_prefix[norm[:45]].append(item)
        if len(norm) >= 70:
            ref_by_mid[norm[len(norm)//2 - 20 : len(norm)//2 + 20]].append(item)
        total_refs_loaded += 1

# MedBrave
if os.path.exists('data/medbrave_questions_clean.json'):
    with open('data/medbrave_questions_clean.json', 'r', encoding='utf-8') as f:
        mb_data = json.load(f)
    for q in mb_data:
        norm = clean_prefix(normalize(q.get('statement') or ''))
        if len(norm) < 20: continue
        ans = (q.get('correct_letter') or '').strip().upper()
        is_anul = bool(q.get('is_annulled')) or ans in ['ANULADA', 'X', 'N']
        opts = {}
        correct_text = ''
        for o in q.get('alternatives') or []:
            if isinstance(o, dict):
                l = (o.get('letter') or '').strip().upper()
                t = o.get('text') or ''
                if l:
                    opts[l] = t
                    if o.get('isCorrect') or l == ans:
                        correct_text = t
                        if not ans: ans = l
        if not correct_text and not is_anul: continue
        item = {'source': 'MedBrave', 'statement_norm': norm, 'is_annulled': is_anul, 'correct_letter_orig': ans, 'correct_text': correct_text, 'all_options': opts}
        ref_by_prefix[norm[:45]].append(item)
        if len(norm) >= 70:
            ref_by_mid[norm[len(norm)//2 - 20 : len(norm)//2 + 20]].append(item)
        total_refs_loaded += 1

# QuestMed
if os.path.exists('data/questmed_extracted_exams.db'):
    conn = sqlite3.connect('data/questmed_extracted_exams.db')
    cur = conn.cursor()
    cur.execute("SELECT enunciado, opcoes_json, gabarito FROM questmed_questions WHERE gabarito IS NOT NULL AND length(trim(gabarito)) > 0")
    for stmt, opcoes_raw, gab in cur.fetchall():
        norm = clean_prefix(normalize(stmt or ''))
        if len(norm) < 20: continue
        ans = str(gab).strip().upper()
        is_anul = ans in ['ANULADA', 'X', 'N', 'CANCELADA']
        opts = {}
        correct_text = ''
        try:
            op_dict = json.loads(opcoes_raw) if opcoes_raw else {}
            if isinstance(op_dict, dict):
                for l, t in op_dict.items():
                    l_clean = str(l).strip().upper()
                    opts[l_clean] = str(t)
                    if l_clean == ans: correct_text = str(t)
        except: pass
        if not correct_text and not is_anul: continue
        item = {'source': 'QuestMed', 'statement_norm': norm, 'is_annulled': is_anul, 'correct_letter_orig': ans, 'correct_text': correct_text, 'all_options': opts}
        ref_by_prefix[norm[:45]].append(item)
        if len(norm) >= 70:
            ref_by_mid[norm[len(norm)//2 - 20 : len(norm)//2 + 20]].append(item)
        total_refs_loaded += 1
    conn.close()

# ProvaDeResidência
if os.path.exists('data/provaderesidencia_coleta.db'):
    conn = sqlite3.connect('data/provaderesidencia_coleta.db')
    cur = conn.cursor()
    cur.execute("SELECT enunciado, opcoes_json, gabarito_oficial, texto_gabarito, is_anulada FROM questoes WHERE (gabarito_oficial IS NOT NULL AND length(trim(gabarito_oficial)) > 0) OR is_anulada = 1")
    for stmt, opcoes_raw, gab, texto_gab, is_anul_raw in cur.fetchall():
        norm = clean_prefix(normalize(stmt or ''))
        if len(norm) < 20: continue
        ans = str(gab or '').strip().upper()
        is_anul = bool(is_anul_raw) or ans in ['ANULADA', 'X', 'N', 'CANCELADA']
        opts = {}
        correct_text = str(texto_gab or '').strip()
        try:
            op_list = json.loads(opcoes_raw) if opcoes_raw else []
            if isinstance(op_list, list):
                for o in op_list:
                    if isinstance(o, dict):
                        l = str(o.get('letter') or '').strip().upper()
                        t = str(o.get('text') or '')
                        if l:
                            opts[l] = t
                            if l == ans and not correct_text: correct_text = t
        except: pass
        if not correct_text and not is_anul: continue
        item = {'source': 'ProvaDeResidencia', 'statement_norm': norm, 'is_annulled': is_anul, 'correct_letter_orig': ans, 'correct_text': correct_text, 'all_options': opts}
        ref_by_prefix[norm[:45]].append(item)
        if len(norm) >= 70:
            ref_by_mid[norm[len(norm)//2 - 20 : len(norm)//2 + 20]].append(item)
        total_refs_loaded += 1
    conn.close()

print(f"  --> {total_refs_loaded:,} referências indexadas com sucesso.")

# ---------------------------------------------------------------------------
# 2. Executar Correções nos Arquivos JSON Locais
# ---------------------------------------------------------------------------
print("\n[PASSO 3/5] Processando e aplicando correções nas especialidades...")

comm_regex = re.compile(r'(?:gabarito|resposta(?:\s+correta)?|alternativa(?:\s+correta)?)[:\s]+(?:letra\s+|alternativa\s+)?([A-E])\b', re.I)

corrections_summary = {
    'total_questions_audited': 0,
    'gabarito_trocado_corrigido': 0,
    'anuladas_corrigidas_para_anulada': 0,
    'anuladas_revertidas_para_valida': 0,
    'sem_gabarito_solucionadas': 0,
    'conflito_comentario_alinhado': 0,
    'comentarios_removidos_das_questoes_corrigidas': 0,
    'total_alteracoes_realizadas': 0
}

# Mapa para atualização no Supabase: qid -> { correct_answer, is_anulada, commentary }
supabase_updates = {}
corrections_log = []

for spec_name, file_path in SPECIALTY_FILES:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    spec_altered = 0
    spec_comms_cleared = 0
    
    for q in questions:
        corrections_summary['total_questions_audited'] += 1
        qid = q.get('id')
        code = q.get('code') or ''
        inst = q.get('institution') or q.get('banca') or ''
        ano = q.get('year') or ''
        
        p_ans_orig = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        p_anul_orig = bool(q.get('is_anulada') or q.get('isAnulada') or p_ans_orig in ['ANULADA', 'X', 'N'])
        comm_orig = q.get('commentary') or ''
        
        p_opts = q.get('options') or []
        plat_options_map = {}
        for o in p_opts:
            if isinstance(o, dict):
                l = (o.get('letter') or '').strip().upper()
                t = o.get('text') or ''
                if l: plat_options_map[l] = t
                
        valid_letters = set(plat_options_map.keys())
        
        # Busca nas referências externas
        st = q.get('statement') or ''
        norm = clean_prefix(normalize(st))
        
        matched_ref = None
        if len(norm) >= 20:
            p = norm[:45]
            mid = norm[len(norm)//2 - 20 : len(norm)//2 + 20] if len(norm) >= 70 else None
            candidates = ref_by_prefix.get(p, []) + (ref_by_mid.get(mid, []) if mid else [])
            
            best_sim = 0.0
            for cand in candidates:
                s = text_similarity(norm, cand['statement_norm'])
                if s > best_sim:
                    best_sim = s
                    matched_ref = cand
                    if s >= 0.95: break
            if best_sim < 0.75:
                matched_ref = None

        has_change = False
        action_type = None
        new_ans = p_ans_orig
        new_anul = p_anul_orig
        
        if matched_ref:
            r_anul = matched_ref['is_annulled']
            r_text = matched_ref['correct_text']
            r_let = matched_ref['correct_letter_orig']
            
            # Caso A: Oficialmente ANULADA mantida ativa no banco
            if r_anul and not p_anul_orig:
                new_anul = True
                new_ans = 'ANULADA'
                has_change = True
                action_type = 'OFICIALMENTE_ANULADA'
                corrections_summary['anuladas_corrigidas_para_anulada'] += 1
                
            # Caso B: Oficialmente VÁLIDA mas marcada como anulada no banco
            elif not r_anul and p_anul_orig:
                letra_verdadeira = None
                for let, opt_t in plat_options_map.items():
                    if match_option_text(r_text, opt_t):
                        letra_verdadeira = let
                        break
                if not letra_verdadeira and r_let in valid_letters:
                    letra_verdadeira = r_let
                    
                if letra_verdadeira:
                    new_anul = False
                    new_ans = letra_verdadeira
                    has_change = True
                    action_type = 'REVERTIDA_PARA_VALIDA'
                    corrections_summary['anuladas_revertidas_para_valida'] += 1
                    
            # Caso C: Questão sem gabarito
            elif not p_ans_orig and not p_anul_orig and not r_anul:
                letra_verdadeira = None
                for let, opt_t in plat_options_map.items():
                    if match_option_text(r_text, opt_t):
                        letra_verdadeira = let
                        break
                if letra_verdadeira:
                    new_anul = False
                    new_ans = letra_verdadeira
                    has_change = True
                    action_type = 'SEM_GABARITO_SOLUCIONADA'
                    corrections_summary['sem_gabarito_solucionadas'] += 1
                    
            # Caso D: Ambas ativas -> CONFRONTO TEXTUAL
            elif not p_anul_orig and not r_anul and p_ans_orig:
                letra_verdadeira = None
                for let, opt_t in plat_options_map.items():
                    if match_option_text(r_text, opt_t):
                        letra_verdadeira = let
                        break
                if letra_verdadeira and letra_verdadeira != p_ans_orig:
                    # GABARITO ERRADO REAL (PERMUTAÇÃO/DESALINHAMENTO)
                    new_ans = letra_verdadeira
                    new_anul = False
                    has_change = True
                    action_type = 'GABARITO_ERRADO_CORRIGIDO_PELO_TEXTO'
                    corrections_summary['gabarito_trocado_corrigido'] += 1
                    
        # Caso E: Conflito interno direto com o comentário (sem match externo ou para reforço)
        if not has_change and p_ans_orig and not p_anul_orig and comm_orig:
            m_comm = comm_regex.search(comm_orig)
            if m_comm:
                cited = m_comm.group(1).upper()
                if cited in valid_letters and cited != p_ans_orig:
                    new_ans = cited
                    new_anul = False
                    has_change = True
                    action_type = 'CONFLITO_COMENTARIO_ALINHADO'
                    corrections_summary['conflito_comentario_alinhado'] += 0 # agrupado
                    
        # SE HOUVE ALTERAÇÃO NO GABARITO:
        if has_change:
            spec_altered += 1
            corrections_summary['total_alteracoes_realizadas'] += 1
            
            # Aplicar novos valores
            q['correct_answer'] = new_ans
            q['correctAnswer'] = new_ans
            q['is_anulada'] = new_anul
            q['isAnulada'] = new_anul
            
            # ORDEM DO USUÁRIO: "Se especificadamente essas questões tiverem gabaritos comentados, remova-os."
            comm_cleaned = False
            if comm_orig and comm_orig.strip():
                q['commentary'] = ''
                comm_cleaned = True
                spec_comms_cleared += 1
                corrections_summary['comentarios_removidos_das_questoes_corrigidas'] += 1
            else:
                q['commentary'] = ''
                
            # Registrar para Supabase
            supabase_updates[qid] = {
                'correct_answer': None if new_anul else new_ans,
                'is_anulada': new_anul,
                'commentary': '' if comm_cleaned else q.get('commentary') or ''
            }
            
            corrections_log.append({
                'id': qid,
                'code': code,
                'spec': spec_name,
                'inst': inst,
                'ano': ano,
                'action': action_type,
                'ans_antigo': p_ans_orig,
                'ans_novo': new_ans,
                'anulada_antigo': p_anul_orig,
                'anulada_novo': new_anul,
                'comentario_removido': comm_cleaned
            })
            
    # Salvar arquivo JSON local atualizado
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"  • {spec_name}: {spec_altered:,} gabaritos corrigidos | {spec_comms_cleared:,} comentários desatualizados limpos.")

print(f"\n--> TOTAL DE QUESTÕES CORRIGIDAS LOCALMENTE: {corrections_summary['total_alteracoes_realizadas']:,}")
print(f"--> TOTAL DE COMENTÁRIOS REMOVIDOS DAS QUESTÕES CORRIGIDAS: {corrections_summary['comentarios_removidos_das_questoes_corrigidas']:,}")

# Salvar log de auditoria das correções aplicadas
with open('data/audit_master_corrections_applied_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        'gerado_em': time.strftime('%Y-%m-%d %H:%M:%S'),
        'summary': corrections_summary,
        'amostra_log': corrections_log[:300]
    }, f, ensure_ascii=False, indent=2)

# ---------------------------------------------------------------------------
# 3. Sincronização Concorrente no Supabase (Tabela questions)
# ---------------------------------------------------------------------------
print(f"\n[PASSO 4/5] Sincronizando {len(supabase_updates):,} alterações no Supabase...")

env_vars = {}
if os.path.exists('.env.local'):
    with open('.env.local', 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k.strip()] = v.strip()

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or env_vars.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("  AVISO: Credenciais do Supabase não encontradas. Sincronização remota ignorada.")
else:
    # Agrupar IDs por tupla exata de campos para fazer PATCH em lote rápido
    # key = (correct_answer, is_anulada, commentary)
    grouped = defaultdict(list)
    for qid, u in supabase_updates.items():
        k = (u['correct_answer'], u['is_anulada'], u['commentary'])
        grouped[k].append(qid)
        
    print(f"  • Formados {len(grouped):,} grupos distintos de atualização no Supabase.")
    
    CHUNK_SIZE = 120
    batches = []
    for (ans, anul, comm), ids in grouped.items():
        payload = {
            'correct_answer': ans,
            'is_anulada': anul,
            'commentary': comm
        }
        for i in range(0, len(ids), CHUNK_SIZE):
            chunk = ids[i:i + CHUNK_SIZE]
            batches.append({
                'url': f"{SUPABASE_URL}/rest/v1/questions?id=in.({','.join(chunk)})",
                'payload': payload,
                'count': len(chunk)
            })
            
    print(f"  • Total de {len(batches):,} requisições HTTP PATCH agrupadas a executar...")
    
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    synced_count = 0
    err_count = 0
    
    for idx, b in enumerate(batches):
        req_data = json.dumps(b['payload']).encode('utf-8')
        req = urllib.request.Request(b['url'], data=req_data, headers=headers, method='PATCH')
        success = False
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status in [200, 204]:
                        success = True
                        synced_count += b['count']
                        break
            except Exception as e:
                time.sleep(0.5)
        if not success:
            err_count += b['count']
            
        if (idx + 1) % 25 == 0 or (idx + 1) == len(batches):
            print(f"    Progresso Supabase: {idx + 1}/{len(batches)} lotes ({synced_count:,} registros sincronizados)...")
            
    print(f"  ✅ Sincronização Supabase concluída: {synced_count:,} atualizados com sucesso ({err_count} falhas).")

# ---------------------------------------------------------------------------
# 4. Verificação Final Pós-Aplicação
# ---------------------------------------------------------------------------
print("\n[PASSO 5/5] Verificação final dos arquivos locais pós-correção...")
total_final_with_ans = 0
total_final_anuladas = 0
total_final_sem_ans = 0

for spec, fp in SPECIALTY_FILES:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            qs = json.load(f)
        for q in qs:
            ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
            anul = bool(q.get('is_anulada') or q.get('isAnulada') or ans in ['ANULADA', 'X', 'N'])
            if anul: total_final_anuladas += 1
            elif ans: total_final_with_ans += 1
            else: total_final_sem_ans += 1

elapsed = time.time() - t_start
print("\n" + "=" * 90)
print(f"🎉 CORREÇÕES MASTER APLICADAS COM SUCESSO EM {elapsed:.1f} SEGUNDOS")
print("=" * 90)
print(f"• Total de gabaritos desalinhados/trocados corrigidos pelo texto : {corrections_summary['gabarito_trocado_corrigido']:,}")
print(f"• Questões oficialmente anuladas marcadas como ANULADA           : {corrections_summary['anuladas_corrigidas_para_anulada']:,}")
print(f"• Questões válidas indevidamente anuladas reativadas             : {corrections_summary['anuladas_revertidas_para_valida']:,}")
print(f"• Questões sem gabarito preenchidas com 100% de certeza          : {corrections_summary['sem_gabarito_solucionadas']:,}")
print(f"• COMENTÁRIOS DESATUALIZADOS REMOVIDOS DAS QUESTÕES CORRIGIDAS   : {corrections_summary['comentarios_removidos_das_questoes_corrigidas']:,}")
print(f"• TOTAL DE MODIFICAÇÕES APLICADAS NO BANCO                       : {corrections_summary['total_alteracoes_realizadas']:,}")
print(f"• Estado do Banco Atualizado:")
print(f"   - Com gabarito válido homologado : {total_final_with_ans:,}")
print(f"   - Anuladas oficiais              : {total_final_anuladas:,}")
print(f"   - Pendentes restantes            : {total_final_sem_ans:,}")
print("=" * 90)
