import json
import unicodedata
import re

def safe_str(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return text

with open('data/staging/censo_instituicoes_e_anos_expansao.json', 'r', encoding='utf-8') as fp:
    d = json.load(fp)

total = d['total_questoes']
print("=" * 70)
print(f"RESUMO EXECUTIVO: QUESTOES DE EXPANSAO ({total:,} QUESTOES)")
print("=" * 70)

print("\n1. DISTRIBUICAO POR ORIGEM / CATEGORIA:")
for cat, cnt in d['categorias'].items():
    pct = (cnt / total) * 100
    print(f"  * {safe_str(cat):45s}: {cnt:7,d} ({pct:5.2f}%)")

print("\n2. PLATAFORMAS PREPARATORIAS, BANCOS E SIMULADOS IDENTIFICADOS:")
for plat, pdata in d['plataformas_e_simulados'].items():
    anos_str = ', '.join([f"{y}: {c}" for y, c in list(pdata['anos'].items())[-4:]])
    print(f"  * {safe_str(plat):35s}: {pdata['total']:5,d} q | Anos: {anos_str}")

print("\n3. APOSTILAS / MATERIAIS TEORICOS (DRIVE):")
for ap, cnt in list(d['apostilas'].items())[:15]:
    print(f"  * {safe_str(ap)[:50]:50s}: {cnt:4,d} q")

print("\n4. TOP 30 INSTITUICOES E BANCAS OFICIAIS:")
for o in d['top_instituicoes_oficiais'][:30]:
    anos_str = ', '.join([f"{y}: {c}" for y, c in list(o['anos'].items())[-4:]])
    print(f"  * {safe_str(o['instituicao'])[:45]:45s}: {o['total']:5,d} q | Anos: {anos_str}")

print("\n5. DISTRIBUICAO POR ANO (SERIE HISTORICA DA EXPANSAO):")
print(f"{'Ano':<8} | {'Oficiais':<12} | {'Plataformas/Apostilas':<22} | {'Total':<10}")
print("-" * 60)
all_years = sorted(list(set(list(d['por_ano_oficiais'].keys()) + list(d['por_ano_plataformas'].keys()))), key=lambda x: (0 if str(x).isdigit() else 1, int(x) if str(x).isdigit() else 0))
for y in all_years:
    of = d['por_ano_oficiais'].get(str(y), 0)
    pl = d['por_ano_plataformas'].get(str(y), 0)
    print(f"{str(y):<8} | {of:<12,d} | {pl:<22,d} | {of+pl:<10,d}")

