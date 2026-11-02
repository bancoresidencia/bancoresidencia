import urllib.request
import json
import os
import re
import sys
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

print("=" * 80)
print("CORREÇÃO DEFINITIVA DE METADADOS (BANCA, ANO, INSTITUIÇÃO, TEMAS)")
print("ADEQUAÇÃO AOS FILTROS CLÍNICOS E HISTÓRICOS NO SUPABASE")
print("=" * 80)

# 1. Carrega credenciais do Supabase
with open('.env.local', 'r', encoding='utf-8') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
SERVICE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY', env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')).strip('\"\'')

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json'
}

# 2. Indexa todas as fontes locais
print("\n[1/3] Indexando todas as fontes de dados locais ricas...")
source_map = {} # qid -> dict

def index_file(filepath):
    if not os.path.exists(filepath):
        print(f"  Arquivo não encontrado: {filepath}")
        return
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = json.load(f)
            items = content if isinstance(content, list) else content.get('questions', [])
            count = 0
            for q in items:
                qid = q.get('id')
                if not qid:
                    continue
                existing = source_map.get(qid, {})
                
                # Resolução robusta de campos
                loc = q.get('location') or {}
                inst = q.get('institution') or loc.get('name') or existing.get('institution', '')
                banca = q.get('banca') or existing.get('banca', '')
                if not banca and inst:
                    banca = inst.split(' - ')[0].strip()
                
                year = q.get('year') or q.get('exam_year') or existing.get('year')
                if year is not None:
                    try:
                        year = int(year)
                    except:
                        pass
                
                spec_v2 = q.get('specialty_v2') or {}
                esp = q.get('especialidade') or q.get('specialty') or spec_v2.get('name') or existing.get('especialidade', '')
                
                theme_v2 = q.get('theme_v2') or {}
                tema = q.get('tema') or theme_v2.get('name') or existing.get('tema', '')
                
                focus_v2 = q.get('focus_v2') or {}
                foco = q.get('foco') or focus_v2.get('name') or existing.get('foco', '')
                
                subfocus_v2 = q.get('subfocus_v2') or {}
                subfoco = q.get('subfoco') or subfocus_v2.get('name') or existing.get('subfoco', '')

                source_map[qid] = {
                    'institution': inst,
                    'banca': banca,
                    'year': year,
                    'especialidade': esp,
                    'tema': tema,
                    'foco': foco,
                    'subfoco': subfoco
                }
                count += 1
            print(f"  -> {os.path.basename(filepath)}: {count:,} questões indexadas.")
    except Exception as e:
        print(f"  Erro ao indexar {filepath}: {e}")

local_files = [
    'data/ginecologia_final_questions.json',
    'data/ginecologia_medevo_extracted.json',
    'data/all_homologated_questions_gold.json',
    'data/urologia_final_questions.json',
    'data/urologia_medevo_extracted.json',
    'data/backups_pre_correcao/cirurgia_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/clinica_medica_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/medicina_preventiva_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/obstetricia_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/pediatria_final_questions.json.bak_phase3'
]

for lf in local_files:
    index_file(lf)

print(f"Total de questões únicas com metadados indexadas: {len(source_map):,}\n")

# 3. Varredura completa no Supabase para coletar questões que precisam de correção
print("[2/3] Identificando questões que necessitam de correção no banco...")

batch_size = 1000
last_id = None
year_pattern = re.compile(r'-(\d{4})-')
patch_queue = [] # list of (qid, patch_dict, log_info)
total_scanned = 0

while True:
    if last_id:
        url = f"{SUPABASE_URL}/rest/v1/questions?select=id,code,institution,banca,year,especialidade,tema,foco,subfoco&order=id.asc&id=gt.{last_id}&limit={batch_size}"
    else:
        url = f"{SUPABASE_URL}/rest/v1/questions?select=id,code,institution,banca,year,especialidade,tema,foco,subfoco&order=id.asc&limit={batch_size}"

    req = urllib.request.Request(url, headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Erro ao ler lote: {e}")
        time.sleep(2)
        continue

    if not data:
        break

    for row in data:
        total_scanned += 1
        qid = row.get('id')
        code = row.get('code') or ''
        curr_inst = (row.get('institution') or '').strip()
        curr_banca = (row.get('banca') or '').strip()
        curr_year = row.get('year')
        curr_tema = (row.get('tema') or '').strip()
        curr_foco = (row.get('foco') or '').strip()
        curr_subfoco = (row.get('subfoco') or '').strip()

        # Verifica código por ano
        code_year = None
        if code:
            m = year_pattern.search(code)
            if m:
                code_year = int(m.group(1))

        # Dados da fonte local rica
        local = source_map.get(qid) or {}

        # Determina os valores ideais
        target_inst = local.get('institution') or ''
        target_banca = local.get('banca') or ''
        target_year = local.get('year') or code_year or curr_year
        target_tema = local.get('tema') or ''
        target_foco = local.get('foco') or ''
        target_subfoco = local.get('subfoco') or ''

        # Se target_inst estiver vazio, usa curr_banca ou target_banca
        if not target_inst or target_inst in ['Oficial', 'Banca Oficial']:
            if target_banca and target_banca not in ['Oficial', 'Banca Oficial']:
                target_inst = target_banca
            elif curr_banca and curr_banca not in ['Oficial', 'Banca Oficial']:
                target_inst = curr_banca

        # Se target_banca estiver vazio, usa o prefixo de target_inst
        if not target_banca or target_banca in ['Oficial', 'Banca Oficial']:
            if curr_banca and curr_banca not in ['Oficial', 'Banca Oficial']:
                target_banca = curr_banca
            elif target_inst and target_inst not in ['Oficial', 'Banca Oficial']:
                target_banca = target_inst.split(' - ')[0].strip()
            elif code:
                parts = code.split('-')
                if len(parts) >= 3 and parts[0] not in ['BANCA', 'OFICIAL']:
                    target_banca = parts[0]

        # Monta objeto de patch apenas para campos que precisam ser alterados
        patch = {}

        # 1. Institution
        if curr_inst in ['Oficial', 'Banca Oficial', ''] and target_inst and target_inst not in ['Oficial', 'Banca Oficial']:
            patch['institution'] = target_inst

        # 2. Banca
        if (curr_banca in ['Oficial', 'Banca Oficial', ''] or not curr_banca) and target_banca and target_banca not in ['Oficial', 'Banca Oficial']:
            patch['banca'] = target_banca
        elif not curr_banca and target_banca:
            patch['banca'] = target_banca

        # 3. Year
        if code_year and curr_year != code_year:
            patch['year'] = code_year
        elif target_year and curr_year != target_year:
            patch['year'] = target_year

        # 4. Tema, Foco, Subfoco
        if not curr_tema and target_tema:
            patch['tema'] = target_tema
        if not curr_foco and target_foco:
            patch['foco'] = target_foco
        if not curr_subfoco and target_subfoco:
            patch['subfoco'] = target_subfoco

        if patch:
            patch_queue.append((qid, patch, f"Code: {code} | Banco: [{curr_inst} {curr_year}] -> Patch: {patch}"))

    last_id = data[-1]['id']
    if total_scanned % 15000 == 0:
        print(f"  -> {total_scanned:,} questões verificadas ({len(patch_queue):,} na fila de patch)...")

    if len(data) < batch_size:
        break

print(f"\nVarredura concluída! Total de questões a corrigir: {len(patch_queue):,}\n")

if len(patch_queue) == 0:
    print("✨ Nenhuma correção necessária! A base já está perfeitamente ajustada.")
    sys.exit(0)

# 4. Executa a correção no Supabase via PATCH paralelo cirúrgico
print(f"[3/3] Aplicando patches seguros no Supabase (Pool de 12 workers paralelos)...")

def patch_question(item):
    qid, patch_body, log_info = item
    url = f"{SUPABASE_URL}/rest/v1/questions?id=eq.{qid}"
    payload_bytes = json.dumps(patch_body).encode('utf-8')
    
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request(
                url,
                data=payload_bytes,
                headers=headers,
                method='PATCH'
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                if 200 <= resp.status < 300:
                    return (True, qid, None)
                return (False, qid, f"HTTP {resp.status}")
        except Exception as e:
            if attempt == 3:
                return (False, qid, str(e))
            time.sleep(0.5 * attempt)
    return (False, qid, "Erro desconhecido")

success_count = 0
fail_count = 0
t_start = time.time()

with ThreadPoolExecutor(max_workers=12) as executor:
    futures = {executor.submit(patch_question, item): item for item in patch_queue}
    done_count = 0
    for future in as_completed(futures):
        done_count += 1
        ok, qid, err = future.result()
        if ok:
            success_count += 1
        else:
            fail_count += 1

        if done_count % 250 == 0 or done_count == len(patch_queue):
            elapsed = time.time() - t_start
            rate = done_count / elapsed if elapsed > 0 else 0
            percent = (done_count / len(patch_queue)) * 100
            print(f"  -> Progresso: {done_count:,} / {len(patch_queue):,} ({percent:.1f}%) | Sucessos: {success_count:,} | Erros: {fail_count} | {rate:.1f} q/s")

elapsed = time.time() - t_start
print("\n" + "=" * 80)
print(f"RELATÓRIO FINAL DA CORREÇÃO:")
print(f"Total de questões corrigidas com sucesso no Supabase: {success_count:,}")
print(f"Falhas: {fail_count}")
print(f"Tempo total de execução: {elapsed:.1f} segundos")
print("=" * 80)
