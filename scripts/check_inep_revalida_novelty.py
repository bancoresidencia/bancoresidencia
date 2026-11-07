import json
import os
import re
import unicodedata
import sys
from collections import defaultdict

def strip_urls_and_clean(text):
    if not text:
        return ''
    text = re.sub(r'https?://\S+', '', text)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def get_keys(text):
    c = strip_urls_and_clean(text)
    words = [w for w in c.split() if len(w) >= 3]
    fp = ' '.join(words[:15])
    prefix = c[:45]
    return fp, prefix

backup_dir = 'data/backups/pre_etapa1_expansao_20261106'
staging_file = 'data/staging/expansao_ineditas_consolidadas.jsonl'

print("[INFO] Indexando questoes INEP Revalida da Base Ativa...", flush=True)

ativa_fp_map = {}
ativa_prefix_map = {}
ativa_count = 0

for fname in os.listdir(backup_dir):
    if not fname.endswith('.json') or fname == 'manifest_backup.json':
        continue
    with open(f'{backup_dir}/{fname}', 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = strip_urls_and_clean(q.get('institution') or '')
            banca = strip_urls_and_clean(q.get('banca') or '')
            code = strip_urls_and_clean(q.get('code') or '')
            if 'inep' in inst or 'revalida' in inst or 'inep' in banca or 'revalida' in banca or 'revalida' in code:
                ativa_count += 1
                fp_k, pfx_k = get_keys(q.get('statement') or '')
                if fp_k:
                    ativa_fp_map[fp_k] = q
                if pfx_k:
                    ativa_prefix_map[pfx_k] = q

print(f"[BASE ATIVA] Total de questoes INEP Revalida indexadas: {ativa_count:,}", flush=True)

# 2. Ler questões da expansão
print("[INFO] Confrontando com as questoes de expansao...", flush=True)

by_year = defaultdict(lambda: {'total': 0, 'repetidas': 0, 'novas': 0})
samples_rep = []
samples_nov = []
total_eval = 0

with open(staging_file, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        q = json.loads(line)
        inst = strip_urls_and_clean(q.get('institution') or '')
        banca = strip_urls_and_clean(q.get('banca') or '')
        code = strip_urls_and_clean(q.get('code') or '')
        yr = str(q.get('year') or 'N/A')
        
        # Filtra questões de Revalida / INEP dos anos 2021 a 2026
        if yr in ['2021', '2022', '2023', '2024', '2025', '2026']:
            if any(k in inst for k in ['inep', 'revalida']) or any(k in banca for k in ['inep', 'revalida']) or any(k in code for k in ['inep', 'revalida']):
                total_eval += 1
                by_year[yr]['total'] += 1
                
                fp_k, pfx_k = get_keys(q.get('statement') or '')
                
                match_q = None
                if fp_k in ativa_fp_map:
                    match_q = ativa_fp_map[fp_k]
                elif pfx_k in ativa_prefix_map:
                    match_q = ativa_prefix_map[pfx_k]
                
                if match_q:
                    by_year[yr]['repetidas'] += 1
                    if len(samples_rep) < 3:
                        samples_rep.append({
                            'exp_year': yr,
                            'exp_code': q.get('code'),
                            'exp_inst': q.get('institution'),
                            'at_year': match_q.get('year'),
                            'at_code': match_q.get('code'),
                            'at_inst': match_q.get('institution'),
                            'stmt': (q.get('statement') or '')[:100]
                        })
                else:
                    by_year[yr]['novas'] += 1
                    if len(samples_nov) < 3:
                        samples_nov.append({
                            'exp_year': yr,
                            'exp_code': q.get('code'),
                            'exp_inst': q.get('institution'),
                            'stmt': (q.get('statement') or '')[:100]
                        })

print("\n" + "=" * 75, flush=True)
print("AUDITORIA CONCLUSIVA: AS QUESTOES DO INEP REVALIDA 2021-2026 SAO NOVAS?", flush=True)
print("=" * 75, flush=True)
print(f"{'Ano':<6} | {'Expansao':<10} | {'Repetidas (Ja Existiam)':<25} | {'Realmente Novas':<18} | {'% Repetidas':<12}", flush=True)
print("-" * 75, flush=True)

tot_e = sum(v['total'] for v in by_year.values())
tot_r = sum(v['repetidas'] for v in by_year.values())
tot_n = sum(v['novas'] for v in by_year.values())

for yr in ['2021', '2022', '2023', '2024', '2025', '2026']:
    d = by_year[yr]
    pct = (d['repetidas'] / d['total'] * 100) if d['total'] else 0
    print(f"{yr:<6} | {d['total']:<10,d} | {d['repetidas']:<25,d} | {d['novas']:<18,d} | {pct:5.1f}%", flush=True)

print("-" * 75, flush=True)
pct_g = (tot_r / tot_e * 100) if tot_e else 0
print(f"{'TOTAL':<6} | {tot_e:<10,d} | {tot_r:<25,d} | {tot_n:<18,d} | {pct_g:5.1f}%", flush=True)
print("=" * 75, flush=True)

if samples_rep:
    print("\n--- AMOSTRA DE QUESTOES IDENTIFICADAS COMO REPETIDAS ---", flush=True)
    for sr in samples_rep:
        print(f"Expansao: {sr['exp_year']} [{sr['exp_code']}] ({sr['exp_inst']})", flush=True)
        print(f"Base Ativa: {sr['at_year']} [{sr['at_code']}] ({sr['at_inst']})", flush=True)
        print(f"Enunciado: \"{sr['stmt']}...\"\n", flush=True)

if samples_nov:
    print("\n--- AMOSTRA DE QUESTOES REALMENTE INEDITAS ---", flush=True)
    for sn in samples_nov:
        print(f"Expansao: {sn['exp_year']} [{sn['exp_code']}] ({sn['exp_inst']})", flush=True)
        print(f"Enunciado: \"{sn['stmt']}...\"\n", flush=True)
