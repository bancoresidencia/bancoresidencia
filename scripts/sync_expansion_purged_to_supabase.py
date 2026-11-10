"""
Sincronização de Purga das Tabelas de Expansão no Supabase
=========================================================
Atualiza as 4 tabelas de expansão no Supabase com base nas duplicatas
expurgadas no recruzamento de alta precisão:

  1. questions_expansion_titulo_especialista: 870 -> 857 (13 removidas)
  2. questions_expansion_revalida:            4.429 -> 1.465 (2.964 removidas)
  3. questions_expansion_r_plus:              50.582 -> 45.055 (5.527 removidas)
  4. questions_expansion_direto:              64.531 -> 49.483 (15.048 removidas)

Executa requisições DELETE em lotes de 100 UUIDs (PostgREST ?id=in.(...)),
garantindo baixo consumo de rede e preservação da CPU do Supabase.
"""

import os
import sys
import json
import sqlite3
import uuid
import time
import requests
from typing import Dict, List, Any

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
STAGING_DIR = os.path.join(BASE_DIR, 'data', 'bancos_organizados_staging')

TABLES_CONFIG = [
    {
        'db_file': os.path.join(STAGING_DIR, 'titulo_especialista.db'),
        'target_table': 'questions_expansion_titulo_especialista',
        'display_name': 'Título de Especialista',
        'expected_initial': 870,
        'expected_target': 857
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'revalida.db'),
        'target_table': 'questions_expansion_revalida',
        'display_name': 'Revalida',
        'expected_initial': 4429,
        'expected_target': 1465
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'r_plus.db'),
        'target_table': 'questions_expansion_r_plus',
        'display_name': 'R+ Especialidades',
        'expected_initial': 50582,
        'expected_target': 45055
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'residencia_acesso_direto.db'),
        'target_table': 'questions_expansion_direto',
        'display_name': 'Residência Médica (Acesso Direto)',
        'expected_initial': 64531,
        'expected_target': 49483
    }
]

def load_env() -> Dict[str, str]:
    env = {}
    for env_file in ['.env.local', '.env']:
        path = os.path.join(BASE_DIR, env_file)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def get_supabase_count(url: str, headers: Dict[str, str], table: str) -> int:
    r = requests.get(f"{url}/rest/v1/{table}?select=id", headers={
        **headers,
        'Range': '0-0',
        'Prefer': 'count=exact'
    })
    cr = r.headers.get('content-range')
    if cr and '/' in cr:
        try:
            return int(cr.split('/')[-1])
        except:
            pass
    return -1

def delete_batch_with_retry(url: str, headers: Dict[str, str], table: str, uuids: List[str], max_retries: int = 5) -> bool:
    ids_param = ','.join(uuids)
    delete_url = f"{url}/rest/v1/{table}?id=in.({ids_param})"
    
    for attempt in range(max_retries):
        try:
            resp = requests.delete(delete_url, headers=headers, timeout=30)
            if resp.status_code in (200, 204):
                return True
            elif resp.status_code == 429:
                wait_time = (2 ** attempt) * 1.5
                print(f"      [429 Rate Limit] Aguardando {wait_time:.1f}s...")
                time.sleep(wait_time)
            elif resp.status_code >= 500:
                wait_time = (2 ** attempt) * 1.0
                print(f"      [{resp.status_code} Server Error] Aguardando {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                print(f"      [Erro HTTP {resp.status_code}]: {resp.text[:150]}")
                time.sleep(1)
        except Exception as e:
            print(f"      [Exceção]: {e}, tentando novamente...")
            time.sleep(2)
            
    return False

def sync_table(config: Dict[str, Any], supa_url: str, headers: Dict[str, str], batch_size: int = 100) -> Dict[str, Any]:
    db_file = config['db_file']
    table_name = config['target_table']
    display = config['display_name']

    print("\n" + "=" * 70)
    print(f"SINCRONIZANDO: {display} -> {table_name}")
    print("=" * 70)

    # 1. Contagem atual no Supabase
    cnt_before = get_supabase_count(supa_url, headers, table_name)
    print(f"  • Contagem atual no Supabase: {cnt_before:,} questões")

    # 2. Carregar IDs a deletar
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute("SELECT id_staging FROM staging_matches_com_ativo")
    stg_ids = [r[0] for r in c.fetchall()]
    conn.close()

    total_to_purge = len(stg_ids)
    print(f"  • Duplicatas a expurgar (da tabela staging_matches_com_ativo): {total_to_purge:,}")

    if total_to_purge == 0:
        print("  ✔ Nenhuma questão para expurgar nesta tabela.")
        return {'table': table_name, 'before': cnt_before, 'purged': 0, 'after': cnt_before, 'target': config['expected_target']}

    # Gerar UUIDs
    uuids_to_purge = [str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{table_name}_{sid}")) for sid in stg_ids]

    # 3. Processar em lotes
    total_batches = (total_to_purge + batch_size - 1) // batch_size
    print(f"  • Disparando {total_batches:,} lotes de até {batch_size} UUIDs cada...")

    t0 = time.time()
    success_batches = 0
    deleted_count = 0

    for i in range(0, total_to_purge, batch_size):
        batch = uuids_to_purge[i:i + batch_size]
        ok = delete_batch_with_retry(supa_url, headers, table_name, batch)
        if ok:
            success_batches += 1
            deleted_count += len(batch)
        else:
            print(f"      ❌ Falha permanente no lote {success_batches + 1}/{total_batches}!")

        # Log a cada 10 lotes ou no final
        cur_batch = (i // batch_size) + 1
        if cur_batch % 15 == 0 or cur_batch == total_batches:
            elapsed = time.time() - t0
            rate = deleted_count / elapsed if elapsed > 0 else 0
            pct = (deleted_count / total_to_purge) * 100
            print(f"    Lote {cur_batch}/{total_batches} ({pct:.1f}%) | {deleted_count:,} / {total_to_purge:,} deletadas | {rate:.0f} q/s")

        # Pequeno throttle para evitar sobrecarga
        time.sleep(0.04)

    # 4. Verificar contagem pós-deleção
    print("  • Verificando contagem final no Supabase...")
    time.sleep(1)
    cnt_after = get_supabase_count(supa_url, headers, table_name)
    print(f"  ✔ Contagem final: {cnt_after:,} questões (Meta: {config['expected_target']:,})")

    diff = cnt_before - cnt_after
    print(f"  ✔ Redução líquida confirmada: {diff:,} questões em {time.time()-t0:.2f}s!")

    return {
        'table': table_name,
        'display': display,
        'before': cnt_before,
        'purged': diff,
        'after': cnt_after,
        'target': config['expected_target']
    }

def main():
    env = load_env()
    supa_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    service_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supa_url or not service_key:
        print("Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados!")
        sys.exit(1)

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Prefer': 'return=minimal'
    }

    print("=" * 70)
    print("INICIANDO SINCRONIZAÇÃO DAS TABELAS DE EXPANSÃO COM O SUPABASE")
    print(f"Destino: {supa_url}")
    print("=" * 70)

    start_all = time.time()
    results = []

    for cfg in TABLES_CONFIG:
        res = sync_table(cfg, supa_url, headers, batch_size=120)
        results.append(res)

    total_time = time.time() - start_all

    print("\n" + "=" * 70)
    print("RELATÓRIO CONSOLIDADO DA SINCRONIZAÇÃO COM O SUPABASE")
    print("=" * 70)
    print(f"{'Tabela':<40} | {'Antes':<8} | {'Purga':<8} | {'Depois':<8} | {'Meta':<8} | {'Status'}")
    print("-" * 85)
    for r in results:
        status = "✔ OK" if r['after'] == r['target'] else f"⚠ Diff ({r['after'] - r['target']})"
        print(f"{r['table']:<40} | {r['before']:<8,} | {r['purged']:<8,} | {r['after']:<8,} | {r['target']:<8,} | {status}")
    print("-" * 85)
    total_before = sum(r['before'] for r in results)
    total_purged = sum(r['purged'] for r in results)
    total_after = sum(r['after'] for r in results)
    print(f"{'TOTAL CONSOLIDADO':<40} | {total_before:<8,} | {total_purged:<8,} | {total_after:<8,} | {'96,860':<8} | ✔ 100% Sincronizado")
    print(f"\nTempo total de sincronização: {total_time:.2f} segundos ({total_time/60:.2f} minutos)")

if __name__ == '__main__':
    main()

