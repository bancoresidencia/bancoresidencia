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

PLATFORM_KEYWORDS = [
    'hardwork', 'questmed', 'medbrave', 'estrategia', 'sanar', 'medway',
    'medcel', 'simulado', 'inedit', 'autoral', 'professor', 'banco de questoes',
    'provaderesidencia', 'medcurso', 'medgrupo', 'sic', 'revisamed', 'jaleko',
    'pensar med', 'medsoft'
]

print("[INFO] Lendo questoes de expansao em:", STAGING_FILE)

total_expansion = 0
by_origin = {'Oficial': 0, 'Plataforma/Inedita': 0}
institutions_data = defaultdict(lambda: {
    'total': 0,
    'tipo': 'Oficial',
    'bancas': defaultdict(int),
    'years': defaultdict(int),
    'samples': []
})

year_by_type = {
    'Oficial': defaultdict(int),
    'Plataforma/Inedita': defaultdict(int)
}

with open(STAGING_FILE, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        total_expansion += 1
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
        
        # Detector de plataforma / questão autoral
        search_blob = norm(f"{inst} {banca} {code} {tipo_prova}")
        is_platform = any(k in search_blob for k in PLATFORM_KEYWORDS)
        
        origem = 'Plataforma/Inedita' if is_platform else 'Oficial'
        by_origin[origem] += 1
        year_by_type[origem][yr_val] += 1
        
        inst_entry = institutions_data[inst]
        inst_entry['total'] += 1
        inst_entry['tipo'] = origem
        inst_entry['bancas'][banca] += 1
        inst_entry['years'][yr_val] += 1
        if len(inst_entry['samples']) < 2:
            inst_entry['samples'].append({
                'code': code,
                'banca': banca,
                'year': yr_val,
                'statement': (q.get('statement') or '')[:80]
            })

print(f"[INFO] Total de questões de expansão processadas: {total_expansion:,}")
print(f"  • Instituições Oficiais       : {by_origin['Oficial']:,} ({by_origin['Oficial']/total_expansion*100:.2f}%)")
print(f"  • Plataformas/Inéditas/Simul. : {by_origin['Plataforma/Inedita']:,} ({by_origin['Plataforma/Inedita']/total_expansion*100:.2f}%)")
print(f"  • Total de Instituições Únicas: {len(institutions_data):,}")

# Salvar resumo estruturado em JSON para alimentar o relatório
output_data = {
    'total_questoes': total_expansion,
    'resumo_origem': by_origin,
    'anos_por_origem': {
        'Oficial': dict(year_by_type['Oficial']),
        'Plataforma/Inedita': dict(year_by_type['Plataforma/Inedita'])
    },
    'instituicoes_ranking': []
}

for inst, d in sorted(institutions_data.items(), key=lambda x: -x[1]['total']):
    output_data['instituicoes_ranking'].append({
        'instituicao': inst,
        'tipo': d['tipo'],
        'total': d['total'],
        'bancas': dict(d['bancas']),
        'years': dict(sorted(d['years'].items(), key=lambda x: (0 if str(x[0]).isdigit() else 1, int(x[0]) if str(x[0]).isdigit() else 0))),
        'samples': d['samples']
    })

with open('data/staging/auditoria_instituicoes_expansao.json', 'w', encoding='utf-8') as fp:
    json.dump(output_data, fp, ensure_ascii=False, indent=2)

print("[OK] Auditoria salva em: data/staging/auditoria_instituicoes_expansao.json")

