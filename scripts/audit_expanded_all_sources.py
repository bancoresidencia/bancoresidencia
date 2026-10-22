import urllib.request
import json
import os
import re
import unicodedata
import time
from collections import defaultdict, Counter

print("=" * 80)
print("AUDITORIA AMPLIADA DE GABARITOS — TODAS AS BASES DE REFERÊNCIA vs SUPABASE")
print("MODO: 100% LEITURA (ZERO ALTERAÇÕES DE DADOS NO BANCO)")
print("=" * 80)

# 1. Carrega credenciais do Supabase
with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Range-Unit': 'items'
}

def normalize_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def text_similarity(a, b):
    na = normalize_text(a)
    nb = normalize_text(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    wa = set(na.split())
    wb = set(nb.split())
    if not wa or not wb:
        return 0.0
    inter = len(wa.intersection(wb))
    union = len(wa.union(wb))
    return inter / union if union > 0 else 0.0

def get_opt_text(options_list, letter):
    if not options_list or not letter:
        return ''
    letter_clean = letter.strip().upper()
    for opt in options_list:
        if isinstance(opt, dict):
            l = str(opt.get('letter') or opt.get('id') or '').strip().upper()
            if l == letter_clean:
                return opt.get('text') or ''
    return ''

# 2. Consolidação de todas as bases de referência em memória
print("\n[1/4] Consolidando acervos de referência (Base Ouro, Ginecologia, Urologia)...")
unified_references = {} # qid -> { id, institution, year, specialty, statement, options, correct_answer, is_anulada, source }

# Base 1: Ouro Homologada (9.487)
try:
    with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as f:
        gold = json.load(f)
        for q in gold:
            qid = q.get('id')
            if qid:
                unified_references[qid] = {
                    'id': qid,
                    'institution': q.get('institution') or '',
                    'year': q.get('year') or '',
                    'specialty': q.get('especialidade') or '',
                    'statement': q.get('statement') or '',
                    'options': q.get('options') or [],
                    'correct_answer': (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper(),
                    'is_anulada': bool(q.get('is_anulada')),
                    'source': 'Base Ouro Homologada (Editais/Bancas)'
                }
    print(f"  -> Base Ouro indexada: {len(gold)} registros.")
except Exception as e:
    print(f"  Erro ao carregar Base Ouro: {e}")

# Base 2: Ginecologia e Obstetrícia Final (13.246)
try:
    with open('data/ginecologia_final_questions.json', 'r', encoding='utf-8') as f:
        gin = json.load(f)
        added_gin = 0
        for q in gin:
            qid = q.get('id')
            if qid and qid not in unified_references:
                ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
                if ans or q.get('is_anulada') or q.get('isAnulada'):
                    unified_references[qid] = {
                        'id': qid,
                        'institution': q.get('institution') or '',
                        'year': q.get('year') or '',
                        'specialty': q.get('especialidade') or 'Ginecologia e Obstetrícia',
                        'statement': q.get('statement') or '',
                        'options': q.get('options') or [],
                        'correct_answer': ans,
                        'is_anulada': bool(q.get('is_anulada') or q.get('isAnulada')),
                        'source': 'Acervo Ginecologia e Obstetrícia'
                    }
                    added_gin += 1
    print(f"  -> Ginecologia indexada: +{added_gin} registros inéditos.")
except Exception as e:
    print(f"  Erro ao carregar Ginecologia: {e}")

# Base 3: Urologia Final (987)
try:
    with open('data/urologia_final_questions.json', 'r', encoding='utf-8') as f:
        uro = json.load(f)
        added_uro = 0
        for q in uro:
            qid = q.get('id')
            if qid and qid not in unified_references:
                ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
                if ans or q.get('is_anulada'):
                    unified_references[qid] = {
                        'id': qid,
                        'institution': q.get('institution') or '',
                        'year': q.get('year') or '',
                        'specialty': q.get('especialidade') or 'Urologia',
                        'statement': q.get('statement') or '',
                        'options': q.get('options') or [],
                        'correct_answer': ans,
                        'is_anulada': bool(q.get('is_anulada')),
                        'source': 'Acervo Urologia'
                    }
                    added_uro += 1
    print(f"  -> Urologia indexada: +{added_uro} registros inéditos.")
except Exception as e:
    print(f"  Erro ao carregar Urologia: {e}")

total_refs = len(unified_references)
print(f"Total unificado de questões de referência com gabarito: {total_refs:,}\n")

# 3. Consulta as questões correspondentes na plataforma (Supabase) via REST API
print("[2/4] Consultando as questões na tabela 'questions' do Supabase em lotes...")
all_ids = list(unified_references.keys())
batch_size = 100
total_batches = (len(all_ids) + batch_size - 1) // batch_size

platform_questions = {}
t0 = time.time()

for b_idx in range(total_batches):
    start = b_idx * batch_size
    batch_ids = all_ids[start:start + batch_size]
    
    id_param = ','.join(batch_ids)
    url = f"{SUPABASE_URL}/rest/v1/questions?id=in.({id_param})&select=id,institution,banca,year,especialidade,statement,options,correct_answer,is_anulada"
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            rows = json.loads(res.read())
            for r in rows:
                platform_questions[r['id']] = r
    except Exception as e:
        print(f"Aviso no lote {b_idx + 1}/{total_batches}: {e}")
        time.sleep(1)
        
    if (b_idx + 1) % 25 == 0 or (b_idx + 1) == total_batches:
        print(f"  Progresso: Lote {b_idx + 1}/{total_batches} ({len(platform_questions):,} questões carregadas)...")

elapsed = time.time() - t0
print(f"Download concluído: {len(platform_questions):,} questões da plataforma obtidas em {elapsed:.1f}s.\n")

# 4. Executa Comparação Estrita pelo Texto da Alternativa
print("[3/4] Executando comparação estrita de alternativas (texto contra texto)...")

stats = {
    'total_analisadas': len(platform_questions),
    'concordante_exato': 0,          # Mesma letra e mesmo texto
    'concordante_texto_caderno': 0,  # Letra diferente por tipo de prova, mas texto 100% igual
    'divergente_real': 0,            # Texto da alternativa é diferente (gabarito errado!)
    'divergencia_anulada': 0,        # Status de anulação conflitante
    'plataforma_sem_gabarito': 0,    # Em branco na plataforma mas com gabarito na referência
}

divergencias_completas = []
por_instituicao = defaultdict(lambda: {'total': 0, 'concordantes': 0, 'divergentes': 0, 'anulacoes': 0})
por_ano = defaultdict(lambda: {'total': 0, 'concordantes': 0, 'divergentes': 0, 'anulacoes': 0})
por_especialidade = defaultdict(lambda: {'total': 0, 'concordantes': 0, 'divergentes': 0, 'anulacoes': 0})

for qid, p_q in platform_questions.items():
    ref = unified_references[qid]
    
    inst = p_q.get('institution') or ref.get('institution') or 'Indefinida'
    ano = p_q.get('year') or ref.get('year') or 'N/D'
    esp = p_q.get('especialidade') or ref.get('specialty') or 'Clínica Geral'
    
    inst_key = inst.split(' - ')[0].strip() if ' - ' in inst else inst[:40].strip()
    ano_key = str(ano)
    esp_key = esp.split('/')[0].strip()
    
    por_instituicao[inst_key]['total'] += 1
    por_ano[ano_key]['total'] += 1
    por_especialidade[esp_key]['total'] += 1
    
    p_ans = str(p_q.get('correct_answer') or '').strip().upper()
    r_ans = str(ref.get('correct_answer') or '').strip().upper()
    
    p_anul = bool(p_q.get('is_anulada')) or ('ANUL' in p_ans)
    r_anul = bool(ref.get('is_anulada')) or ('ANUL' in r_ans) or (r_ans in ['X', 'N', 'ANULADA', 'CANCELADA'])
    
    p_opts = p_q.get('options') or []
    r_opts = ref.get('options') or []
    
    # Caso 1: Divergência de Anulação
    if p_anul != r_anul:
        stats['divergencia_anulada'] += 1
        por_instituicao[inst_key]['anulacoes'] += 1
        por_ano[ano_key]['anulacoes'] += 1
        por_especialidade[esp_key]['anulacoes'] += 1
        divergencias_completas.append({
            'id': qid,
            'tipo': 'DIVERGENCIA_ANULACAO',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'fonte': ref.get('source'),
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': 'ANULADA' if p_anul else p_ans,
            'plataforma_texto': '(Questão Anulada na Plataforma)' if p_anul else get_opt_text(p_opts, p_ans),
            'fonte_letra': 'ANULADA' if r_anul else r_ans,
            'fonte_texto': '(Questão Anulada Oficialmente)' if r_anul else get_opt_text(r_opts, r_ans),
            'motivo': 'Discrepância no status de anulação oficial'
        })
        continue
        
    if p_anul and r_anul:
        stats['concordante_exato'] += 1
        por_instituicao[inst_key]['concordantes'] += 1
        por_ano[ano_key]['concordantes'] += 1
        por_especialidade[esp_key]['concordantes'] += 1
        continue
        
    # Caso 2: Plataforma sem gabarito
    if not p_ans and r_ans in ['A', 'B', 'C', 'D', 'E']:
        stats['plataforma_sem_gabarito'] += 1
        divergencias_completas.append({
            'id': qid,
            'tipo': 'SEM_GABARITO_NA_PLATAFORMA',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'fonte': ref.get('source'),
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': 'VAZIO',
            'plataforma_texto': '(Sem gabarito registrado)',
            'fonte_letra': r_ans,
            'fonte_texto': get_opt_text(r_opts, r_ans),
            'motivo': 'Questão pendente na plataforma com gabarito disponível na fonte'
        })
        continue
        
    # Caso 3: Ambas possuem gabarito assinalado -> Comparação Textual
    p_text = get_opt_text(p_opts, p_ans)
    r_text = get_opt_text(r_opts, r_ans)
    
    sim = text_similarity(p_text, r_text)
    
    if sim >= 0.85:
        if p_ans == r_ans:
            stats['concordante_exato'] += 1
        else:
            stats['concordante_texto_caderno'] += 1
        por_instituicao[inst_key]['concordantes'] += 1
        por_ano[ano_key]['concordantes'] += 1
        por_especialidade[esp_key]['concordantes'] += 1
    else:
        # Texto difere!
        alternativa_encontrada = None
        for opt in p_opts:
            if isinstance(opt, dict):
                opt_t = opt.get('text') or ''
                if text_similarity(opt_t, r_text) >= 0.85:
                    alternativa_encontrada = opt.get('letter')
                    break
                    
        stats['divergente_real'] += 1
        por_instituicao[inst_key]['divergentes'] += 1
        por_ano[ano_key]['divergentes'] += 1
        por_especialidade[esp_key]['divergentes'] += 1
        
        divergencias_completas.append({
            'id': qid,
            'tipo': 'DIVERGENCIA_TEXTO_GABARITO',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'fonte': ref.get('source'),
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': p_ans,
            'plataforma_texto': p_text[:120],
            'fonte_letra': r_ans,
            'fonte_texto': r_text[:120],
            'alternativa_correspondente_plataforma': alternativa_encontrada,
            'motivo': f"Fonte oficial aponta opção '{alternativa_encontrada or 'N/D'}' na plataforma em vez da '{p_ans}'"
        })

total_concordantes = stats['concordante_exato'] + stats['concordante_texto_caderno']

print("\n" + "=" * 80)
print("AUDITORIA AMPLIADA CONCLUÍDA COM SUCESSO (ZERO MODIFICAÇÕES NO BANCO)")
print("=" * 80)
print(f"Total de questões comparadas        : {stats['total_analisadas']:,}")
print(f"Concordantes Exatos (Letra + Texto) : {stats['concordante_exato']:,} ({stats['concordante_exato']/stats['total_analisadas']*100:.1f}%)")
print(f"Concordantes por Texto (Caderno Div): {stats['concordante_texto_caderno']:,} ({stats['concordante_texto_caderno']/stats['total_analisadas']*100:.2f}%)")
print(f"--> TOTAL CONCORDANTES CONFIRMADOS  : {total_concordantes:,} ({total_concordantes/stats['total_analisadas']*100:.1f}%)")
print(f"\n[ALERTAS DE DIVERGÊNCIA]")
print(f"Divergência Real de Gabarito (Texto): {stats['divergente_real']:,} ({stats['divergente_real']/stats['total_analisadas']*100:.2f}%)")
print(f"Divergência de Anulação             : {stats['divergencia_anulada']:,} ({stats['divergencia_anulada']/stats['total_analisadas']*100:.2f}%)")
print(f"Sem Gabarito na Plataforma          : {stats['plataforma_sem_gabarito']:,}")

# Salva JSON completo
audit_json = {
    'gerado_em': time.strftime('%Y-%m-%d %H:%M:%S'),
    'modo': 'READ_ONLY_AUDIT',
    'stats': stats,
    'total_concordantes': total_concordantes,
    'total_divergentes': stats['divergente_real'] + stats['divergencia_anulada'],
    'top_instituicoes_divergentes': sorted(
        [{'instituicao': k, **v} for k, v in por_instituicao.items() if v['divergentes'] > 0],
        key=lambda x: x['divergentes'], reverse=True
    )[:25],
    'por_ano': dict(sorted(por_ano.items(), key=lambda x: str(x[0]), reverse=True)),
    'por_especialidade': dict(sorted(por_especialidade.items(), key=lambda x: x[1]['divergentes'], reverse=True)),
    'amostra_divergencias': divergencias_completas[:100],
    'total_divergencias_catalogadas': len(divergencias_completas)
}

with open('data/auditoria_completa_cruzamento_gabaritos.json', 'w', encoding='utf-8') as f:
    json.dump(audit_json, f, ensure_ascii=False, indent=2)

print("\nArquivo JSON gravado com sucesso em 'data/auditoria_completa_cruzamento_gabaritos.json'")
