import json
import unicodedata

def safe_str(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return text

with open('data/staging/censo_instituicoes_modalidades_completo.json', 'r', encoding='utf-8') as fp:
    d = json.load(fp)

total = d['total_questoes']

print("=" * 75)
print(f"CENSO GERAL DE MODALIDADES NO BANCO COMPLETO ({total:,} QUESTOES)")
print("=" * 75)

for mod, cnt in sorted(d['distribuicao_modalidades'].items(), key=lambda x: -x[1]):
    pct = (cnt / total) * 100
    print(f"• {safe_str(mod):35s}: {cnt:7,d} ({pct:5.2f}%)")

print("\n" + "=" * 75)
print("TOP 35 INSTITUICOES DO BANCO: DETALHAMENTO POR MODALIDADE")
print("=" * 75)
print(f"{'#':<3} | {'Instituicao':<40} | {'Total':<6} | {'Acesso (R1)':<11} | {'R+ Espec.':<10} | {'Titulo':<7} | {'Revalida':<8}")
print("-" * 92)

for i, inst in enumerate(d['ranking_instituicoes'][:35], 1):
    name = safe_str(inst['instituicao'])[:38]
    tot = inst['total']
    ac = inst['acesso_direto']
    rp = inst['r_plus']
    te = inst['titulo_especialista']
    rev = inst['revalida']
    print(f"{i:<3} | {name:<40} | {tot:<6,d} | {ac:<11,d} | {rp:<10,d} | {te:<7,d} | {rev:<8,d}")

