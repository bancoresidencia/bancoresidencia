import json
import os
import re
import unicodedata
import sys
from collections import defaultdict

def norm(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def prefix_key(text):
    n = norm(text)
    return n[:45]

print("=" * 70, flush=True)
print("INVESTIGACAO FORENSE OTIMIZADA: QUESTOES INEP REVALIDA", flush=True)
print("=" * 70, flush=True)

# 1. Carregar questões INEP Revalida da BASE ATIVA (Backup Pré-Etapa 1)
backup_dir = 'data/backups/pre_etapa1_expansao_20261106'
revalida_ativa = []
ativa_prefix_map = defaultdict(list)
ativa_years = defaultdict(int)
ativa_insts = defaultdict(int)

for fname in os.listdir(backup_dir):
    if not fname.endswith('.json') or fname == 'manifest_backup.json':
        continue
    fpath = os.path.join(backup_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = norm(q.get('institution') or '')
            banca = norm(q.get('banca') or '')
            code = norm(q.get('code') or '')
            if 'inep' in inst or 'revalida' in inst or 'inep' in banca or 'revalida' in banca or 'revalida' in code:
                revalida_ativa.append(q)
                yr = str(q.get('year') or 'N/A')
                inst_raw = q.get('institution') or 'N/A'
                ativa_years[yr] += 1
                ativa_insts[inst_raw] += 1
                pk = prefix_key(q.get('statement') or '')
                if pk:
                    ativa_prefix_map[pk].append(q)

print(f"[BASE ATIVA] Total de questoes INEP/Revalida encontradas: {len(revalida_ativa):,}", flush=True)
print("Distribuicao por ano na base ativa:", flush=True)
for yr in sorted(ativa_years.keys(), key=lambda x: (0 if str(x).isdigit() else 1, int(x) if str(x).isdigit() else 0)):
    print(f"  * {yr}: {ativa_years[yr]} questoes", flush=True)

print("Principais nomes de instituicao na base ativa:", flush=True)
for inst, c in sorted(ativa_insts.items(), key=lambda x: -x[1])[:5]:
    print(f"  * {inst}: {c} questoes", flush=True)

# 2. Carregar questões da EXPANSÃO
staging_file = 'data/staging/expansao_ineditas_consolidadas.jsonl'
revalida_expansao = []

with open(staging_file, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        q = json.loads(line)
        inst = q.get('institution') or ''
        banca = q.get('banca') or ''
        code = q.get('code') or ''
        if 'inep - revalida' in inst.lower() or 'revalida' in inst.lower() or 'revalida' in banca.lower() or 'inep' in inst.lower():
            revalida_expansao.append(q)

print(f"\n[EXPANSAO] Total de questoes INEP/Revalida na expansao: {len(revalida_expansao):,}", flush=True)

exp_years = defaultdict(int)
exact_matches = 0
truly_novel = 0
samples_match = []
samples_novel = []

for q in revalida_expansao:
    yr = str(q.get('year') or 'N/A')
    exp_years[yr] += 1
    pk = prefix_key(q.get('statement') or '')
    
    match_found = False
    if pk in ativa_prefix_map:
        for at_q in ativa_prefix_map[pk]:
            # Checagem de similaridade
            s_exp = norm(q.get('statement') or '')
            s_at = norm(at_q.get('statement') or '')
            if s_exp[:80] == s_at[:80] or s_exp in s_at or s_at in s_exp:
                exact_matches += 1
                match_found = True
                if len(samples_match) < 3:
                    samples_match.append({
                        'exp_id': q.get('id'),
                        'exp_year': yr,
                        'exp_inst': q.get('institution'),
                        'orig_id': at_q.get('id'),
                        'orig_year': at_q.get('year'),
                        'orig_inst': at_q.get('institution'),
                        'stmt': (q.get('statement') or '')[:90]
                    })
                break
    
    if not match_found:
        truly_novel += 1
        if len(samples_novel) < 3:
            samples_novel.append({
                'exp_id': q.get('id'),
                'exp_year': yr,
                'exp_inst': q.get('institution'),
                'stmt': (q.get('statement') or '')[:90]
            })

print("\n" + "=" * 70, flush=True)
print("RESULTADO DO CONFRONTO FORENSE:", flush=True)
print("=" * 70, flush=True)
print(f"• Questoes analisadas na expansao : {len(revalida_expansao):,}", flush=True)
print(f"• Repetidas com a base ativa      : {exact_matches:,}", flush=True)
print(f"• Questoes REALMENTE INEDITAS     : {truly_novel:,} ({truly_novel/len(revalida_expansao)*100:.1f}%)", flush=True)

print("\nDistribuicao por ano na expansao:", flush=True)
for yr in sorted(exp_years.keys(), key=lambda x: (0 if str(x).isdigit() else 1, int(x) if str(x).isdigit() else 0)):
    print(f"  * {yr}: {exp_years[yr]} questoes", flush=True)

if samples_novel:
    print("\n--- AMOSTRA DE QUESTOES REALMENTE INEDITAS DO REVALIDA ---", flush=True)
    for sn in samples_novel:
        print(f"Ano: {sn['exp_year']} | Inst: {sn['exp_inst']} | ID: {sn['exp_id']}", flush=True)
        print(f"Enunciado: \"{sn['stmt']}...\"\n", flush=True)

if samples_match:
    print("\n--- AMOSTRA DE EVENTUAIS MATCHES ENCONTRADOS ---", flush=True)
    for sm in samples_match:
        print(f"Expansao: {sm['exp_year']} ({sm['exp_inst']}) vs Ativa: {sm['orig_year']} ({sm['orig_inst']})", flush=True)
        print(f"Enunciado: \"{sm['stmt']}...\"\n", flush=True)
