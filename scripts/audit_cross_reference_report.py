import urllib.request
import json
import os
import re
import unicodedata
import time
from collections import defaultdict

print("=" * 80)
print("AUDITORIA DE GABARITOS: PLATAFORMA (SUPABASE) vs BASE HOMOLOGADA")
print("MODO: 100% LEITURA (ZERO ALTERAÇÕES DE GABARITO)")
print("=" * 80)

# 1. Carrega credenciais
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
    # Normaliza unicode NFD e remove diacríticos
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove pontuação
    text = re.sub(r'[^a-z0-9]', ' ', text)
    # Remove múltiplos espaços
    return re.sub(r'\s+', ' ', text).strip()

def text_similarity(a, b):
    na = normalize_text(a)
    nb = normalize_text(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    # Jaccard de palavras
    wa = set(na.split())
    wb = set(nb.split())
    if not wa or not wb:
        return 0.0
    inter = len(wa.intersection(wb))
    union = len(wa.union(wb))
    return inter / union if union > 0 else 0.0

# 2. Carrega Base Ouro Homologada
print("\n[1/4] Carregando acervo de referência homologado...")
gold_file = 'data/all_homologated_questions_gold.json'
with open(gold_file, 'r', encoding='utf-8') as f:
    gold_list = json.load(f)

print(f"Total de registros na base de referência: {len(gold_list)}")

# Mapeia por ID
gold_by_id = {}
for q in gold_list:
    qid = q.get('id')
    if qid:
        gold_by_id[qid] = q

print(f"Questões de referência com UUID válido: {len(gold_by_id)}")

# 3. Consulta as questões na plataforma Supabase em lotes
print("\n[2/4] Consultando questões na plataforma (Supabase) via REST API em lotes...")
batch_size = 100
all_ids = list(gold_by_id.keys())
total_batches = (len(all_ids) + batch_size - 1) // batch_size

platform_questions = {}
t0 = time.time()

for b_idx in range(total_batches):
    start = b_idx * batch_size
    batch_ids = all_ids[start:start + batch_size]
    
    # Formata filtro PostgREST in.(id1,id2,...)
    id_param = ','.join(batch_ids)
    url = f"{SUPABASE_URL}/rest/v1/questions?id=in.({id_param})&select=id,institution,banca,year,especialidade,statement,options,correct_answer,is_anulada"
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            rows = json.loads(res.read())
            for r in rows:
                platform_questions[r['id']] = r
    except Exception as e:
        print(f"Erro no lote {b_idx + 1}/{total_batches}: {e}")
        time.sleep(1)
        
    if (b_idx + 1) % 15 == 0 or (b_idx + 1) == total_batches:
        print(f"  Progresso: Lote {b_idx + 1}/{total_batches} ({len(platform_questions)} questões baixadas)...")

elapsed = time.time() - t0
print(f"Download concluído: {len(platform_questions)} questões em {elapsed:.1f}s.")

# 4. Cruzamento Semântico e Comparação Textual
print("\n[3/4] Executando cruzamento estrito e comparação de texto de alternativa...")

stats = {
    'total_analisadas': len(platform_questions),
    'concordante_exato': 0,          # Mesma letra e mesmo texto
    'concordante_texto_caderno': 0,  # Letra diferente, mas texto da alternativa é o mesmo (cadernos distintos)
    'divergente_real': 0,            # Texto da alternativa é diferente (possível gabarito errado!)
    'divergencia_anulada': 0,        # Uma fonte anulou e a outra manteve gabarito ativo
    'plataforma_sem_gabarito': 0,    # Plataforma estava nula, mas a fonte tem gabarito
}

divergencias_detalhadas = []
por_instituicao = defaultdict(lambda: {'total': 0, 'concordantes': 0, 'divergentes': 0, 'anulacoes': 0})
por_ano = defaultdict(lambda: {'total': 0, 'concordantes': 0, 'divergentes': 0, 'anulacoes': 0})

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

for qid, p_q in platform_questions.items():
    g_q = gold_by_id[qid]
    
    inst = p_q.get('institution') or g_q.get('institution') or 'Indefinida'
    ano = p_q.get('year') or g_q.get('year') or 'N/D'
    esp = p_q.get('especialidade') or g_q.get('especialidade') or 'Geral'
    
    inst_key = inst.split(' - ')[0].strip() if ' - ' in inst else inst[:35].strip()
    ano_key = str(ano)
    
    por_instituicao[inst_key]['total'] += 1
    por_ano[ano_key]['total'] += 1
    
    p_ans = str(p_q.get('correct_answer') or '').strip().upper()
    g_ans = str(g_q.get('correct_answer') or g_q.get('correctAnswer') or '').strip().upper()
    
    p_anul = bool(p_q.get('is_anulada')) or ('ANUL' in p_ans)
    g_anul = bool(g_q.get('is_anulada')) or ('ANUL' in g_ans) or (g_ans in ['X', 'N', 'ANULADA', 'CANCELADA'])
    
    p_opts = p_q.get('options') or []
    g_opts = g_q.get('options') or []
    
    # Caso 1: Divergência de Anulação
    if p_anul != g_anul:
        stats['divergencia_anulada'] += 1
        por_instituicao[inst_key]['anulacoes'] += 1
        por_ano[ano_key]['anulacoes'] += 1
        divergencias_detalhadas.append({
            'id': qid,
            'tipo': 'DIVERGENCIA_ANULACAO',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': 'ANULADA' if p_anul else p_ans,
            'plataforma_texto': '(Questão Anulada no Sistema)' if p_anul else get_opt_text(p_opts, p_ans),
            'fonte_letra': 'ANULADA' if g_anul else g_ans,
            'fonte_texto': '(Questão Anulada Oficialmente)' if g_anul else get_opt_text(g_opts, g_ans),
            'motivo': 'Discrepância no status de anulação oficial'
        })
        continue
        
    if p_anul and g_anul:
        stats['concordante_exato'] += 1
        por_instituicao[inst_key]['concordantes'] += 1
        por_ano[ano_key]['concordantes'] += 1
        continue
        
    # Caso 2: Plataforma sem gabarito mas a fonte tem
    if not p_ans and g_ans in ['A', 'B', 'C', 'D', 'E']:
        stats['plataforma_sem_gabarito'] += 1
        divergencias_detalhadas.append({
            'id': qid,
            'tipo': 'SEM_GABARITO_NA_PLATAFORMA',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': 'VAZIO',
            'plataforma_texto': '(Sem gabarito registrado)',
            'fonte_letra': g_ans,
            'fonte_texto': get_opt_text(g_opts, g_ans),
            'motivo': 'Questão pendente na plataforma com gabarito disponível na fonte'
        })
        continue
        
    # Caso 3: Ambos possuem gabarito preenchido -> Comparar texto da alternativa!
    p_text = get_opt_text(p_opts, p_ans)
    g_text = get_opt_text(g_opts, g_ans)
    
    # Similaridade do texto da opção correta da plataforma vs opção correta da fonte
    sim = text_similarity(p_text, g_text)
    
    if sim >= 0.85:
        # Textos batem!
        if p_ans == g_ans:
            stats['concordante_exato'] += 1
        else:
            # Letra diferente mas texto igual (caderno embaralhado)
            stats['concordante_texto_caderno'] += 1
        por_instituicao[inst_key]['concordantes'] += 1
        por_ano[ano_key]['concordantes'] += 1
    else:
        # Texto difere! Verifica se o texto da fonte existe em outra alternativa da plataforma
        alternativa_encontrada = None
        for opt in p_opts:
            if isinstance(opt, dict):
                opt_t = opt.get('text') or ''
                if text_similarity(opt_t, g_text) >= 0.85:
                    alternativa_encontrada = opt.get('letter')
                    break
                    
        stats['divergente_real'] += 1
        por_instituicao[inst_key]['divergentes'] += 1
        por_ano[ano_key]['divergentes'] += 1
        
        divergencias_detalhadas.append({
            'id': qid,
            'tipo': 'DIVERGENCIA_TEXTO_GABARITO',
            'instituicao': inst,
            'ano': ano,
            'especialidade': esp,
            'enunciado_snippet': (p_q.get('statement') or '')[:140],
            'plataforma_letra': p_ans,
            'plataforma_texto': p_text[:120],
            'fonte_letra': g_ans,
            'fonte_texto': g_text[:120],
            'alternativa_correspondente_plataforma': alternativa_encontrada,
            'motivo': f"Gabarito da fonte aponta para a opção '{alternativa_encontrada or 'N/D'}' na plataforma em vez da '{p_ans}'"
        })

print("\n" + "=" * 80)
print("RESULTADOS CONSOLIDADOS DA AUDITORIA (SEM ALTERAÇÕES NO BANCO)")
print("=" * 80)
print(f"Total de questões comparadas        : {stats['total_analisadas']:,}")
print(f"Concordantes Exatos (Letra + Texto) : {stats['concordante_exato']:,} ({stats['concordante_exato']/stats['total_analisadas']*100:.1f}%)")
print(f"Concordantes por Texto (Caderno Div): {stats['concordante_texto_caderno']:,} ({stats['concordante_texto_caderno']/stats['total_analisadas']*100:.1f}%)")
total_concordantes = stats['concordante_exato'] + stats['concordante_texto_caderno']
print(f"--> TOTAL CONCORDANTES CONFIRMADOS  : {total_concordantes:,} ({total_concordantes/stats['total_analisadas']*100:.1f}%)")
print(f"\n[ALERTAS DE DIVERGÊNCIA]")
print(f"Divergência Real de Gabarito (Texto): {stats['divergente_real']:,} ({stats['divergente_real']/stats['total_analisadas']*100:.2f}%)")
print(f"Divergência de Anulação             : {stats['divergencia_anulada']:,} ({stats['divergencia_anulada']/stats['total_analisadas']*100:.2f}%)")
print(f"Sem Gabarito na Plataforma          : {stats['plataforma_sem_gabarito']:,}")

# Salva JSON de auditoria
os.makedirs('data', exist_ok=True)
audit_json = {
    'gerado_em': time.strftime('%Y-%m-%d %H:%M:%S'),
    'modo': 'READ_ONLY_AUDIT',
    'stats': stats,
    'total_concordantes': total_concordantes,
    'total_divergentes': stats['divergente_real'] + stats['divergencia_anulada'],
    'divergencias_amostra': divergencias_detalhadas[:50],
    'total_divergencias_registradas': len(divergencias_detalhadas)
}

with open('data/auditoria_cruzamento_gabaritos.json', 'w', encoding='utf-8') as f:
    json.dump(audit_json, f, ensure_ascii=False, indent=2)

print("\nJSON de auditoria gerado em data/auditoria_cruzamento_gabaritos.json")
