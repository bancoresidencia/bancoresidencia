import json
import os
import re
import unicodedata
from collections import defaultdict

def norm(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def classify_modalidade(q):
    mod_raw = norm(q.get('modalidade') or '')
    tipo_raw = norm(q.get('tipo_prova') or '')
    code_raw = norm(q.get('code') or '')
    inst_raw = norm(q.get('institution') or '')
    banca_raw = norm(q.get('banca') or '')
    
    blob = f"{mod_raw} {tipo_raw} {code_raw} {inst_raw} {banca_raw}"
    
    # 1. Revalida
    if 'revalida' in blob or 'inep' in blob:
        return 'Revalida'
        
    # 2. Título de Especialista
    if any(k in blob for k in [
        'titulo', 'especialista', 'tego', 'tea', 'sbp', 'sbc', 'sbpt',
        'febrasgo', 'abp', 'cbcd', 'sbacv', 'sbu', 'sbot', 'ambr'
    ]):
        return 'Título de Especialista'
        
    # 3. R+ Especialidades (Pré-requisito, R3, R4, Especialidades Clínicas/Cirúrgicas/Pediátricas)
    if any(k in blob for k in [
        'r+', 'r3', 'r4', 'r-3', 'r-4', 'r 3', 'r 4', 'pre requisito',
        'prerequisito', 'especialidades', 'subespecialidade', 'subespecialidades',
        'ano adicional', 'area de atuacao', 'endoscopia', 'mastologia',
        'terapia intensiva', 'uti', 'hemodinamica', 'cirurgia plastica',
        'cirurgia vascular', 'coloproctologia', 'urologia', 'oncologia',
        'nefrologia', 'pneumologia', 'cardiologia', 'gastroenterologia',
        'reumatologia', 'hematologia', 'infectologia', 'endocrinologia',
        'neurologia', 'geriatria', 'nutrologia', 'alergia'
    ]) and ('acesso direto' not in blob and 'r1' not in blob and 'prova 1' not in blob):
        return 'R+ Especialidades'
        
    # Padrão: Acesso Direto (Residência Médica R1)
    return 'Acesso Direto'

print("[INFO] Analisando questoes da expansao...", flush=True)

staging_file = 'data/staging/expansao_ineditas_consolidadas.jsonl'
inst_modalidades_exp = defaultdict(lambda: defaultdict(int))
total_exp = 0

with open(staging_file, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        total_exp += 1
        q = json.loads(line)
        inst = (q.get('institution') or 'Não Informada').strip()
        mod = classify_modalidade(q)
        inst_modalidades_exp[inst][mod] += 1

print(f"Total de questões de expansão analisadas: {total_exp:,}", flush=True)
print(f"Total de instituições: {len(inst_modalidades_exp):,}", flush=True)

# Resumo geral das modalidades na expansão
tot_mod = defaultdict(int)
for inst, mods in inst_modalidades_exp.items():
    for m, c in mods.items():
        tot_mod[m] += c

print("\n--- DISTRIBUIÇÃO GERAL POR MODALIDADE (EXPANSÃO) ---", flush=True)
for m, c in sorted(tot_mod.items(), key=lambda x: -x[1]):
    print(f"• {m:25s}: {c:7,d} ({c/total_exp*100:5.2f}%)", flush=True)

# Top 25 instituições com detalhamento
print("\n--- TOP 25 INSTITUIÇÕES DA EXPANSÃO POR MODALIDADE ---", flush=True)
sorted_insts = sorted(inst_modalidades_exp.items(), key=lambda x: -sum(x[1].values()))

for inst, mods in sorted_insts[:25]:
    tot_inst = sum(mods.values())
    acesso = mods.get('Acesso Direto', 0)
    r_plus = mods.get('R+ Especialidades', 0)
    titulo = mods.get('Título de Especialista', 0)
    revalida = mods.get('Revalida', 0)
    print(f"* {inst[:40]:40s} | Total: {tot_inst:4,d} | Acesso: {acesso:4,d} | R+: {r_plus:4,d} | Título: {titulo:3,d} | Revalida: {revalida:3,d}", flush=True)

