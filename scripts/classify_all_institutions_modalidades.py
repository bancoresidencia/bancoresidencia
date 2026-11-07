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
        
    # 3. R+ Especialidades
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
        
    return 'Acesso Direto'

print("[INFO] Processando as 258.953 questoes locais unificadas...", flush=True)

files = [
    'data/medicina_preventiva_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/clinica_medica_final_questions.json'
]

banco_total = 0
inst_mods_total = defaultdict(lambda: defaultdict(int))
mod_totals = defaultdict(int)

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            banco_total += 1
            inst = (q.get('institution') or 'Não Informada').strip()
            mod = classify_modalidade(q)
            inst_mods_total[inst][mod] += 1
            mod_totals[mod] += 1

print(f"Total processado: {banco_total:,} questoes em {len(inst_mods_total):,} instituicoes.")

# Preparar dados para o relatorio
output_data = {
    'total_questoes': banco_total,
    'distribuicao_modalidades': dict(mod_totals),
    'ranking_instituicoes': []
}

for inst, mods in sorted(inst_mods_total.items(), key=lambda x: -sum(x[1].values())):
    output_data['ranking_instituicoes'].append({
        'instituicao': inst,
        'total': sum(mods.values()),
        'acesso_direto': mods.get('Acesso Direto', 0),
        'r_plus': mods.get('R+ Especialidades', 0),
        'titulo_especialista': mods.get('Título de Especialista', 0),
        'revalida': mods.get('Revalida', 0)
    })

out_json = 'data/staging/censo_instituicoes_modalidades_completo.json'
with open(out_json, 'w', encoding='utf-8') as fp:
    json.dump(output_data, fp, ensure_ascii=False, indent=2)

print(f"[OK] Censo completo salvo em: {out_json}")

