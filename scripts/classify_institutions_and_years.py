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

# Plataformas preparatórias e bancos de cursos
PLATAFORMAS_MAP = {
    'hardwork': 'Hardwork Medicina',
    'questmed': 'QuestMed',
    'medbrave': 'MedBrave',
    'estrategia': 'Estratégia MED',
    'sanar': 'SanarMed',
    'medway': 'Medway',
    'medcel': 'Medcel',
    'medcurso': 'MEDGRUPO (Medcurso)',
    'medgrupo': 'MEDGRUPO',
    'provaderesidencia': 'Prova de Residência',
    'revisamed': 'Revisamed',
    'jaleko': 'Jaleko',
    'pensar med': 'Pensar MED'
}

stats = {
    'total': 0,
    'categorias': {
        'Instituicoes Oficiais (Residência/Revalida)': 0,
        'Plataformas Preparatorias / Questoes Autorais': 0,
        'Apostilas e Materiais Didaticos': 0,
        'Simulados e Provas Ineditas': 0
    },
    'por_ano_geral': defaultdict(int),
    'por_ano_oficiais': defaultdict(int),
    'por_ano_plataformas': defaultdict(int),
    'detalhes_plataformas': defaultdict(lambda: {'total': 0, 'anos': defaultdict(int)}),
    'top_instituicoes_oficiais': defaultdict(lambda: {'total': 0, 'anos': defaultdict(int), 'bancas': defaultdict(int)}),
    'apostilas_detalhe': defaultdict(int)
}

with open(STAGING_FILE, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        stats['total'] += 1
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
            
        stats['por_ano_geral'][yr_val] += 1
        
        inst_norm = norm(inst)
        banca_norm = norm(banca)
        code_norm = norm(code)
        tipo_norm = norm(tipo_prova)
        
        # 1. Checar se é apostila / material teórico
        if '.pdf' in inst.lower() or '.pdf' in banca.lower() or 'apostila' in inst_norm or 'apostila' in banca_norm:
            cat = 'Apostilas e Materiais Didaticos'
            stats['categorias'][cat] += 1
            stats['apostilas_detalhe'][inst] += 1
            stats['por_ano_plataformas'][yr_val] += 1
            continue
            
        # 2. Checar se é plataforma preparatória específica
        found_plat = None
        for k, v in PLATAFORMAS_MAP.items():
            if k in inst_norm or k in banca_norm or k in code_norm:
                found_plat = v
                break
                
        # 3. Checar se é simulado / inédita
        is_simulado = any(k in tipo_norm for k in ['simulado', 'inedita', 'autoral']) or any(k in inst_norm for k in ['simulado', 'inedita']) or any(k in banca_norm for k in ['simulado', 'inedita'])

        if is_simulado and not found_plat:
            cat = 'Simulados e Provas Ineditas'
            stats['categorias'][cat] += 1
            stats['por_ano_plataformas'][yr_val] += 1
            stats['detalhes_plataformas']['Simulados / Provas Inéditas Independentes']['total'] += 1
            stats['detalhes_plataformas']['Simulados / Provas Inéditas Independentes']['anos'][yr_val] += 1
        elif found_plat:
            cat = 'Plataformas Preparatorias / Questoes Autorais'
            stats['categorias'][cat] += 1
            stats['por_ano_plataformas'][yr_val] += 1
            stats['detalhes_plataformas'][found_plat]['total'] += 1
            stats['detalhes_plataformas'][found_plat]['anos'][yr_val] += 1
        else:
            cat = 'Instituicoes Oficiais (Residência/Revalida)'
            stats['categorias'][cat] += 1
            stats['por_ano_oficiais'][yr_val] += 1
            inst_obj = stats['top_instituicoes_oficiais'][inst]
            inst_obj['total'] += 1
            inst_obj['anos'][yr_val] += 1
            inst_obj['bancas'][banca] += 1

# Serializar resultado
output_file = 'data/staging/censo_instituicoes_e_anos_expansao.json'

serializable = {
    'total_questoes': stats['total'],
    'categorias': stats['categorias'],
    'por_ano_geral': dict(sorted(stats['por_ano_geral'].items(), key=lambda x: (0 if str(x[0]).isdigit() else 1, int(x[0]) if str(x[0]).isdigit() else 0))),
    'por_ano_oficiais': dict(sorted(stats['por_ano_oficiais'].items(), key=lambda x: (0 if str(x[0]).isdigit() else 1, int(x[0]) if str(x[0]).isdigit() else 0))),
    'por_ano_plataformas': dict(sorted(stats['por_ano_plataformas'].items(), key=lambda x: (0 if str(x[0]).isdigit() else 1, int(x[0]) if str(x[0]).isdigit() else 0))),
    'plataformas_e_simulados': {k: {'total': v['total'], 'anos': dict(sorted(v['anos'].items(), key=lambda x: str(x[0])))} for k, v in sorted(stats['detalhes_plataformas'].items(), key=lambda x: -x[1]['total'])},
    'top_instituicoes_oficiais': [
        {
            'instituicao': k,
            'total': v['total'],
            'anos': dict(sorted(v['anos'].items(), key=lambda x: str(x[0]))),
            'bancas': dict(sorted(v['bancas'].items(), key=lambda x: -x[1])[:3])
        }
        for k, v in sorted(stats['top_instituicoes_oficiais'].items(), key=lambda x: -x[1]['total'])
    ],
    'apostilas': dict(sorted(stats['apostilas_detalhe'].items(), key=lambda x: -x[1]))
}

with open(output_file, 'w', encoding='utf-8') as fp:
    json.dump(serializable, fp, ensure_ascii=False, indent=2)

print(f"[OK] Censo detalhado salvo com sucesso em: {output_file}")

