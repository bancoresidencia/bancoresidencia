import urllib.request
import json
import os
import re
import unicodedata
import time
import sys
from collections import defaultdict

# Força UTF-8 e autoflush no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

print("=" * 80)
print("CENSO COMPLETO E AUDITORIA DAS ~133.000 QUESTÕES DO BANCO RESIDÊNCIA")
print("MÉTODO: KEYSET PAGINATION (ALTA VELOCIDADE VIA ÍNDICE B-TREE)")
print("MODO: 100% LEITURA (ESTRITAMENTE ZERO MODIFICAÇÕES NO BANCO)")
print("=" * 80)

# 1. Carrega credenciais do Supabase
with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}'
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

# 2. Carregar todas as bases de referência em memória
print("\n[1/3] Indexando acervos de referência com gabarito comprovado...")
ref_index = {} # qid -> { correct_answer, is_anulada, options, source }

# Base Ouro Homologada
try:
    with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as f:
        gold = json.load(f)
        for q in gold:
            qid = q.get('id')
            if qid:
                ref_index[qid] = {
                    'correct_answer': (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper(),
                    'is_anulada': bool(q.get('is_anulada')),
                    'options': q.get('options') or [],
                    'source': 'Base Ouro Homologada (Bancas/Editais)'
                }
    print(f"  -> Base Ouro: {len(gold):,} questões indexadas.")
except Exception as e:
    print(f"  Aviso Base Ouro: {e}")

# Ginecologia e Obstetrícia Final
try:
    with open('data/ginecologia_final_questions.json', 'r', encoding='utf-8') as f:
        gin = json.load(f)
        added_gin = 0
        for q in gin:
            qid = q.get('id')
            if qid and qid not in ref_index:
                ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
                if ans or q.get('is_anulada') or q.get('isAnulada'):
                    ref_index[qid] = {
                        'correct_answer': ans,
                        'is_anulada': bool(q.get('is_anulada') or q.get('isAnulada')),
                        'options': q.get('options') or [],
                        'source': 'Acervo Ginecologia/Obstetrícia'
                    }
                    added_gin += 1
    print(f"  -> Ginecologia: +{added_gin:,} questões adicionadas.")
except Exception as e:
    print(f"  Aviso Ginecologia: {e}")

# Urologia Final
try:
    with open('data/urologia_final_questions.json', 'r', encoding='utf-8') as f:
        uro = json.load(f)
        added_uro = 0
        for q in uro:
            qid = q.get('id')
            if qid and qid not in ref_index:
                ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
                if ans or q.get('is_anulada'):
                    ref_index[qid] = {
                        'correct_answer': ans,
                        'is_anulada': bool(q.get('is_anulada')),
                        'options': q.get('options') or [],
                        'source': 'Acervo Urologia'
                    }
                    added_uro += 1
    print(f"  -> Urologia: +{added_uro:,} questões adicionadas.")
except Exception as e:
    print(f"  Aviso Urologia: {e}")

print(f"Total unificado de questões em acervos de referência: {len(ref_index):,}\n")

# 3. Varredura completa das ~133.000 questões do Supabase via Keyset Pagination
print("[2/3] Iniciando varredura rápida e contínua de todas as questões do banco...")

global_stats = {
    'total_questoes': 0,
    'com_gabarito_valido': 0,      # A, B, C, D, E
    'anuladas': 0,                 # is_anulada = True ou gabarito ANULADA
    'sem_gabarito': 0,             # Nulo ou vazio
    'discursivas': 0,              # tipo discursiva ou sem opções
    'outros_formatos': 0
}

fontes_rastreadas = {
    'homologada_lote2': 0,         # Gabarito Oficial Homologado Lote 2
    'processo_homologacao': 0,     # processo de homologação original
    'livros_estrategia': 0,        # Livros Estratégia
    'livros_medcurso': 0,          # Livros Medcurso
    'drive_colecoes': 0,           # Drive/MedEvo
    'gabarito_sem_comentario': 0,  # com resposta mas sem comentário
    'gabarito_com_ia': 0,          # comentário com menção de IA
    'outros_padroes': 0
}

cruzamento_stats = {
    'total_cruzadas': 0,
    'concordante_exato': 0,
    'concordante_texto_caderno': 0,
    'divergente_real_texto': 0,
    'divergencia_anulacao': 0,
    'sem_gabarito_na_plataforma': 0
}

por_instituicao = defaultdict(lambda: {'total': 0, 'com_gab': 0, 'sem_gab': 0, 'anuladas': 0, 'cruzadas': 0, 'divergentes': 0})
por_ano = defaultdict(lambda: {'total': 0, 'com_gab': 0, 'sem_gab': 0, 'anuladas': 0, 'cruzadas': 0, 'divergentes': 0})
por_especialidade = defaultdict(lambda: {'total': 0, 'com_gab': 0, 'sem_gab': 0, 'anuladas': 0, 'cruzadas': 0, 'divergentes': 0})

divergencias_catalogadas = []

batch_size = 1000
last_id = None
t_start = time.time()
batch_num = 0

while True:
    batch_num += 1
    if last_id:
        url = f"{SUPABASE_URL}/rest/v1/questions?select=id,institution,banca,year,especialidade,statement,options,correct_answer,is_anulada,commentary,type&order=id.asc&id=gt.{last_id}&limit={batch_size}"
    else:
        url = f"{SUPABASE_URL}/rest/v1/questions?select=id,institution,banca,year,especialidade,statement,options,correct_answer,is_anulada,commentary,type&order=id.asc&limit={batch_size}"
        
    req = urllib.request.Request(url, headers=headers)
    retries = 3
    rows = None
    
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                rows = json.loads(res.read())
                break
        except Exception as e:
            if attempt == retries - 1:
                print(f"Erro no batch {batch_num} após {retries} tentativas: {e}")
            time.sleep(1)
            
    if not rows:
        break
        
    last_id = rows[-1]['id']
    
    for q in rows:
        global_stats['total_questoes'] += 1
        qid = q.get('id')
        inst = q.get('institution') or 'Banca Não Identificada'
        ano = str(q.get('year') or 'N/D')
        esp = (q.get('especialidade') or 'Clínica Geral').split('/')[0].strip()
        inst_key = inst.split(' - ')[0].strip() if ' - ' in inst else inst[:35].strip()
        
        por_instituicao[inst_key]['total'] += 1
        por_ano[ano]['total'] += 1
        por_especialidade[esp]['total'] += 1
        
        ans = str(q.get('correct_answer') or '').strip().upper()
        is_anul = bool(q.get('is_anulada')) or ('ANUL' in ans) or (ans in ['X', 'CANCELADA'])
        q_type = str(q.get('type') or '')
        comm = q.get('commentary') or ''
        opts = q.get('options') or []
        
        # 1. Status Geral
        if is_anul:
            global_stats['anuladas'] += 1
            por_instituicao[inst_key]['anuladas'] += 1
            por_ano[ano]['anuladas'] += 1
            por_especialidade[esp]['anuladas'] += 1
        elif ans in ['A', 'B', 'C', 'D', 'E']:
            global_stats['com_gabarito_valido'] += 1
            por_instituicao[inst_key]['com_gab'] += 1
            por_ano[ano]['com_gab'] += 1
            por_especialidade[esp]['com_gab'] += 1
        elif 'discursiv' in q_type.lower() or not opts:
            global_stats['discursivas'] += 1
        else:
            global_stats['sem_gabarito'] += 1
            por_instituicao[inst_key]['sem_gab'] += 1
            por_ano[ano]['sem_gab'] += 1
            por_especialidade[esp]['sem_gab'] += 1
            
        # 2. Rastreamento de Fonte
        if ans or is_anul:
            if 'Gabarito Oficial Homologado' in comm:
                fontes_rastreadas['homologada_lote2'] += 1
            elif 'processo de homologação' in comm.lower():
                fontes_rastreadas['processo_homologacao'] += 1
            elif 'Estratégia' in comm or 'Estrategia' in comm:
                fontes_rastreadas['livros_estrategia'] += 1
            elif 'Medcurso' in comm:
                fontes_rastreadas['livros_medcurso'] += 1
            elif 'Drive' in comm:
                fontes_rastreadas['drive_colecoes'] += 1
            elif not comm:
                fontes_rastreadas['gabarito_sem_comentario'] += 1
            elif 'IA' in comm:
                fontes_rastreadas['gabarito_com_ia'] += 1
            else:
                fontes_rastreadas['outros_padroes'] += 1
                
        # 3. Cruzamento com Bases de Referência
        if qid in ref_index:
            ref = ref_index[qid]
            cruzamento_stats['total_cruzadas'] += 1
            por_instituicao[inst_key]['cruzadas'] += 1
            
            r_ans = ref.get('correct_answer') or ''
            r_anul = ref.get('is_anulada') or False
            r_opts = ref.get('options') or []
            
            if is_anul != r_anul:
                cruzamento_stats['divergencia_anulacao'] += 1
                por_instituicao[inst_key]['divergentes'] += 1
                por_ano[ano]['divergentes'] += 1
                por_especialidade[esp]['divergentes'] += 1
                divergencias_catalogadas.append({
                    'id': qid,
                    'tipo': 'DIVERGENCIA_ANULACAO',
                    'instituicao': inst,
                    'ano': ano,
                    'especialidade': esp,
                    'enunciado_snippet': (q.get('statement') or '')[:140],
                    'plataforma_letra': 'ANULADA' if is_anul else ans,
                    'plataforma_texto': '(Questão Anulada)' if is_anul else get_opt_text(opts, ans),
                    'fonte_letra': 'ANULADA' if r_anul else r_ans,
                    'fonte_texto': '(Questão Anulada na Referência)' if r_anul else get_opt_text(r_opts, r_ans),
                    'fonte_nome': ref.get('source'),
                    'motivo': 'Conflito de anulação pós-recurso'
                })
            elif not ans and r_ans in ['A', 'B', 'C', 'D', 'E']:
                cruzamento_stats['sem_gabarito_na_plataforma'] += 1
            else:
                p_t = get_opt_text(opts, ans)
                r_t = get_opt_text(r_opts, r_ans)
                sim = text_similarity(p_t, r_t)
                
                if sim >= 0.85:
                    if ans == r_ans:
                        cruzamento_stats['concordante_exato'] += 1
                    else:
                        cruzamento_stats['concordante_texto_caderno'] += 1
                else:
                    alternativa_encontrada = None
                    for opt in opts:
                        if isinstance(opt, dict):
                            opt_t = opt.get('text') or ''
                            if text_similarity(opt_t, r_t) >= 0.85:
                                alternativa_encontrada = opt.get('letter')
                                break
                                
                    cruzamento_stats['divergente_real_texto'] += 1
                    por_instituicao[inst_key]['divergentes'] += 1
                    por_ano[ano]['divergentes'] += 1
                    por_especialidade[esp]['divergentes'] += 1
                    divergencias_catalogadas.append({
                        'id': qid,
                        'tipo': 'DIVERGENCIA_TEXTO_GABARITO',
                        'instituicao': inst,
                        'ano': ano,
                        'especialidade': esp,
                        'enunciado_snippet': (q.get('statement') or '')[:140],
                        'plataforma_letra': ans,
                        'plataforma_texto': p_t[:120],
                        'fonte_letra': r_ans,
                        'fonte_texto': r_t[:120],
                        'fonte_nome': ref.get('source'),
                        'alternativa_correspondente_plataforma': alternativa_encontrada,
                        'motivo': f"Fonte oficial aponta opção '{alternativa_encontrada or 'N/D'}' em vez de '{ans}'"
                    })
                    
    if global_stats['total_questoes'] % 15000 == 0:
        print(f"  Processadas {global_stats['total_questoes']:,} questões...")
        
    if len(rows) < batch_size:
        break

duracao = time.time() - t_start
print(f"\n[3/3] Varredura completa finalizada em {duracao:.1f}s.")
print(f"Total geral de questões examinadas: {global_stats['total_questoes']:,}")

# 4. Salva o censo completo em JSON
os.makedirs('data', exist_ok=True)
censo_resultado = {
    'gerado_em': time.strftime('%Y-%m-%d %H:%M:%S'),
    'tempo_execucao_segundos': round(duracao, 1),
    'modo_seguro': 'READ_ONLY_ZERO_MODIFICATIONS',
    'global_stats': global_stats,
    'fontes_rastreadas': fontes_rastreadas,
    'cruzamento_stats': cruzamento_stats,
    'top_instituicoes': sorted(
        [{'instituicao': k, **v} for k, v in por_instituicao.items()],
        key=lambda x: x['total'], reverse=True
    )[:50],
    'por_ano': dict(sorted(por_ano.items(), key=lambda x: str(x[0]), reverse=True)),
    'por_especialidade': dict(sorted(por_especialidade.items(), key=lambda x: x[1]['total'], reverse=True)),
    'total_divergencias': len(divergencias_catalogadas),
    'amostra_divergencias': divergencias_catalogadas[:150]
}

with open('data/censo_auditoria_completa_132k.json', 'w', encoding='utf-8') as f:
    json.dump(censo_resultado, f, ensure_ascii=False, indent=2)

with open('data/todas_divergencias_encontradas.json', 'w', encoding='utf-8') as f:
    json.dump(divergencias_catalogadas, f, ensure_ascii=False, indent=2)

print("\nArquivos de auditoria gravados com sucesso:")
print("  - data/censo_auditoria_completa_132k.json")
print("  - data/todas_divergencias_encontradas.json")
