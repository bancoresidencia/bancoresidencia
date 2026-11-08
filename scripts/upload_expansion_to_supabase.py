"""
Motor de Ingestão e Upload Progressivo: Expansão -> Supabase (PostgREST)
Envia as questões higienizadas e deduplicadas dos 4 bancos locais
para as 4 tabelas correspondentes no Supabase:
  1. questions_expansion_titulo_especialista (870 questões)
  2. questions_expansion_revalida            (4.429 questões)
  3. questions_expansion_r_plus              (50.582 questões)
  4. questions_expansion_direto              (64.531 questões)

Ordem Progressiva: Do menor para o maior, monitorando latência e CPU do Supabase.
"""

import os
import sys
import json
import sqlite3
import time
import uuid
import argparse
import requests
from typing import Dict, List, Any

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
STAGING_DIR = os.path.join(DATA_DIR, 'bancos_organizados_staging')

TABLES_CONFIG = [
    {
        'db_file': os.path.join(STAGING_DIR, 'titulo_especialista.db'),
        'target_table': 'questions_expansion_titulo_especialista',
        'display_name': 'Título de Especialista',
        'code_prefix': 'TIT',
        'modalidade_default': 'Título de Especialista',
        'tipo_prova_default': 'Título de Especialista'
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'revalida.db'),
        'target_table': 'questions_expansion_revalida',
        'display_name': 'Revalida',
        'code_prefix': 'REV',
        'modalidade_default': 'Revalida',
        'tipo_prova_default': 'Revalida'
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'r_plus.db'),
        'target_table': 'questions_expansion_r_plus',
        'display_name': 'R+ Especialidades',
        'code_prefix': 'RPL',
        'modalidade_default': 'R+ Cirurgia / Clínica / Pediatria / GO',
        'tipo_prova_default': 'R+'
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'residencia_acesso_direto.db'),
        'target_table': 'questions_expansion_direto',
        'display_name': 'Residência Médica (Acesso Direto)',
        'code_prefix': 'DIR',
        'modalidade_default': 'Residência Médica',
        'tipo_prova_default': 'Residência Médica'
    }
]

def load_env_variables() -> Dict[str, str]:
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

def transform_row_to_payload(row: sqlite3.Row, config: Dict[str, Any]) -> Dict[str, Any]:
    id_staging = row['id_staging']
    table_name = config['target_table']
    
    # UUID v5 determinístico
    q_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{table_name}_{id_staging}"))
    
    gabarito = (row['gabarito'] or '').strip().upper()
    has_gabarito = gabarito in ('A', 'B', 'C', 'D', 'E')
    
    options = []
    if row['opcoes_json']:
        try:
            parsed = json.loads(row['opcoes_json'])
            if isinstance(parsed, list):
                options = parsed
        except:
            options = []

    ano = row['ano']
    try:
        ano = int(ano) if ano and int(ano) > 1900 else None
    except:
        ano = None

    return {
        'id': q_uuid,
        'code': f"EXP-{config['code_prefix']}-{id_staging}",
        'institution': row['instituicao'] or 'Não informada',
        'banca': row['banca'] or row['instituicao'] or 'Não informada',
        'year': ano,
        'tipo_prova': config['tipo_prova_default'],
        'modalidade': row['modalidade'] or config['modalidade_default'],
        'especialidade': row['especialidade'] or 'Não classificada',
        'tema': row['tema'] or 'Geral',
        'foco': row['foco'] or 'Geral',
        'subfoco': row['subfoco'] or 'Geral',
        'difficulty': row['dificuldade'] or 'Médio',
        'type': 'Múltipla escolha',
        'is_anulada': bool(row['is_anulada']),
        'statement': row['enunciado'] or '',
        'options': options,
        'correct_answer': gabarito if has_gabarito else (gabarito or None),
        'commentary': row['comentarios'] or '',
        'images': [],
        'has_gabarito': has_gabarito
    }

def upload_single_table(
    config: Dict[str, Any],
    supabase_url: str,
    supabase_key: str,
    batch_size: int = 250,
    throttle_sleep: float = 0.15,
    dry_run: bool = False
):
    target_table = config['target_table']
    display_name = config['display_name']
    db_file = config['db_file']
    
    print("\n" + "=" * 70)
    print(f"INICIANDO ENVIO: {display_name} -> '{target_table}'")
    print(f"Origem local: {os.path.basename(db_file)}")
    print("=" * 70)
    
    if not os.path.exists(db_file):
        print(f"❌ Arquivo não encontrado: {db_file}")
        return False
        
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM questoes ORDER BY id_staging ASC;")
    rows = cur.fetchall()
    total_q = len(rows)
    print(f"Carregados {total_q:,} registros locais.")
    
    if total_q == 0:
        print("Tabela vazia.")
        conn.close()
        return True

    # Transform
    t_trans = time.time()
    payloads = [transform_row_to_payload(r, config) for r in rows]
    print(f"✔ Registros transformados em {time.time()-t_trans:.2f}s")
    
    endpoint = f"{supabase_url}/rest/v1/{target_table}"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    if dry_run:
        print(f"[DRY-RUN] Simulação concluída com sucesso para {total_q:,} questões.")
        conn.close()
        return True

    uploaded = 0
    t_start = time.time()
    total_batches = (total_q + batch_size - 1) // batch_size
    batch_idx = 0
    
    for i in range(0, total_q, batch_size):
        chunk = payloads[i:i + batch_size]
        batch_idx += 1
        
        success = False
        retries = 5
        backoff = 1.0
        
        while not success and retries > 0:
            try:
                r_start = time.time()
                resp = requests.post(endpoint, headers=headers, json=chunk, timeout=30)
                req_time = (time.time() - r_start) * 1000
                
                if resp.status_code in (200, 201):
                    success = True
                    uploaded += len(chunk)
                    elapsed = time.time() - t_start
                    rate = uploaded / elapsed if elapsed > 0 else 0
                    pct = (uploaded / total_q) * 100
                    eta_sec = (total_q - uploaded) / rate if rate > 0 else 0
                    
                    if batch_idx % 5 == 0 or uploaded == total_q:
                        print(f"  [{target_table}] Lote {batch_idx}/{total_batches} ({pct:5.1f}%) | {uploaded:6,d}/{total_q:,} q | {rate:4.0f} q/s | Req: {req_time:4.0f}ms | ETA: {eta_sec:3.0f}s")
                elif resp.status_code == 429:
                    retries -= 1
                    print(f"  ⚠️ Rate Limit (429)! Dormindo {backoff*2:.1f}s...")
                    time.sleep(backoff * 2)
                    backoff *= 2
                else:
                    retries -= 1
                    print(f"  ⚠️ HTTP {resp.status_code} no lote {batch_idx}: {resp.text[:120]}. Retentando em {backoff:.1f}s...")
                    time.sleep(backoff)
                    backoff *= 2
            except Exception as e:
                retries -= 1
                print(f"  ⚠️ Exceção de rede no lote {batch_idx}: {e}. Retentando em {backoff:.1f}s...")
                time.sleep(backoff)
                backoff *= 2
                
        if not success:
            print(f"❌ FALHA CRÍTICA no lote {batch_idx} após 5 tentativas.")
            conn.close()
            return False
            
        if throttle_sleep > 0:
            time.sleep(throttle_sleep)

    total_time = time.time() - t_start
    print(f"\n🎉 CONCLUÍDO COM SUCESSO: '{target_table}'")
    print(f"Total enviado: {uploaded:,} questões em {total_time:.1f}s ({uploaded/total_time:.0f} q/s médios).")
    conn.close()
    return True

def main():
    parser = argparse.ArgumentParser(description="Upload progressivo para o Supabase")
    parser.add_argument('--execute', action='store_true', default=False, help="Executa o upload real.")
    parser.add_argument('--table', type=str, default=None, help="Processa apenas uma tabela específica.")
    parser.add_argument('--batch-size', type=int, default=250, help="Tamanho do lote (default: 250)")
    parser.add_argument('--throttle', type=float, default=0.15, help="Tempo de espera entre requisições em segundos (default: 0.15s)")
    args = parser.parse_args()

    env = load_env_variables()
    supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Chaves do Supabase não encontradas.")
        sys.exit(1)

    dry_run = not args.execute
    print("=" * 70)
    print("SISTEMA DE UPLOAD PROGRESSIVO: EXPANSÃO -> SUPABASE")
    print("=" * 70)
    print(f"Status: {'[DRY-RUN - SIMULAÇÃO]' if dry_run else '🚀 [EXECUÇÃO REAL ATIVADA]'}")
    print(f"Lote: {args.batch_size} registros/request")
    print(f"Throttling entre lotes: {args.throttle}s")
    print(f"Supabase URL: {supabase_url}")

    configs = TABLES_CONFIG
    if args.table:
        configs = [c for c in TABLES_CONFIG if c['target_table'] == args.table]

    global_start = time.time()
    for cfg in configs:
        ok = upload_single_table(
            config=cfg,
            supabase_url=supabase_url,
            supabase_key=supabase_key,
            batch_size=args.batch_size,
            throttle_sleep=args.throttle,
            dry_run=dry_run
        )
        if not ok:
            print("\n❌ Interrompendo upload progressivo devido a falha.")
            sys.exit(1)
        # Intervalo seguro de 2 segundos entre tabelas para deixar o servidor estabilizar
        if not dry_run and cfg != configs[-1]:
            print("\n⏸ Pausa preventiva de 2 segundos entre tabelas para estabilização da CPU...")
            time.sleep(2.0)

    print("\n" + "=" * 70)
    print(f"TODAS AS TABELAS PROCESSADAS COM SUCESSO EM {time.time() - global_start:.1f} SEGUNDOS!")
    print("=" * 70)

if __name__ == '__main__':
    main()
