import json
import re
import unicodedata
from collections import defaultdict

STAGING_FILE = 'data/staging/expansao_ineditas_consolidadas.jsonl'

def norm(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

PLATFORM_INST_KEYWORDS = [
    'hardwork', 'questmed', 'medbrave', 'estrategia', 'sanar', 'medway',
    'medcel', 'simulado', 'inedit', 'autoral', 'provaderesidencia', 'medcurso',
    'medgrupo', 'sic', 'revisamed', 'jaleko', 'pensar med', 'medsoft',
    'banco de questoes', 'plataforma', 'professor'
]

plataformas_reais = defaultdict(lambda: {'total': 0, 'years': defaultdict(int), 'bancas': defaultdict(int), 'samples': []})
oficiais_reais = defaultdict(lambda: {'total': 0, 'years': defaultdict(int), 'bancas': defaultdict(int), 'samples': []})

total_q = 0

with open(STAGING_FILE, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        total_q += 1
        q = json.loads(line)
        
        inst = (q.get('institution') or 'Não Informada').strip()
        banca = (q.get('banca') or 'Não Informada').strip()
        code = (q.get('code') or '').strip()
        tipo_prova = (q.get('tipo_prova') or '').strip()
        
        yr = q.get('year')
        try:
            yr_val = int(yr) if yr and str(yr).isdigit() else 'Não Informado'
        except:
            yr_val = 'Não Informado'
            
        inst_norm = norm(inst)
        banca_norm = norm(banca)
        tipo_norm = norm(tipo_prova)
        
        # É uma questão originária da plataforma se a INSTITUIÇÃO ou BANCA ou TIPO_PROVA for explicitamente da plataforma
        # e NÃO for uma universidade/hospital oficial (como USP, UNICAMP, SES, etc.)
        is_inst_platform = any(k in inst_norm for k in PLATFORM_INST_KEYWORDS)
        is_banca_platform = any(k in banca_norm for k in PLATFORM_INST_KEYWORDS)
        is_simulado = any(k in tipo_norm for k in ['simulado', 'inedita', 'autoral'])
        
        if is_inst_platform or is_banca_platform or is_simulado:
            entry = plataformas_reais[inst]
            entry['total'] += 1
            entry['years'][yr_val] += 1
            entry['bancas'][banca] += 1
            if len(entry['samples']) < 2:
                entry['samples'].append({
                    'code': code,
                    'banca': banca,
                    'year': yr_val,
                    'statement': (q.get('statement') or '')[:80]
                })
        else:
            entry = oficiais_reais[inst]
            entry['total'] += 1
            entry['years'][yr_val] += 1
            entry['bancas'][banca] += 1
            if len(entry['samples']) < 2:
                entry['samples'].append({
                    'code': code,
                    'banca': banca,
                    'year': yr_val,
                    'statement': (q.get('statement') or '')[:80]
                })

total_plat = sum(p['total'] for p in plataformas_reais.values())
total_ofic = sum(o['total'] for o in oficiais_reais.values())

print(f"Total avaliado: {total_q:,}")
print(f"• Instituições Oficiais Estritas: {total_ofic:,} ({total_ofic/total_q*100:.2f}%) em {len(oficiais_reais):,} instituições")
print(f"• Plataformas / Simulados / Inéditas: {total_plat:,} ({total_plat/total_q*100:.2f}%) em {len(plataformas_reais):,} entidades")

print("\n--- DETALHAMENTO DAS PLATAFORMAS / SIMULADOS ENCONTRADOS ---")
for inst, data in sorted(plataformas_reais.items(), key=lambda x: -x[1]['total']):
    years_str = ', '.join([f"{y}: {c}" for y, c in sorted(data['years'].items(), key=lambda x: str(x[0]))])
    bancas_str = ', '.join([f"{b}: {c}" for b, c in sorted(data['bancas'].items(), key=lambda x: -x[1])[:3]])
    print(f"* {inst} ({data['total']:,} q)")
    print(f"  Anos: {years_str}")
    print(f"  Bancas: {bancas_str}")

