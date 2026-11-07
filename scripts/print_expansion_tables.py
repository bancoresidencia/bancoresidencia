import json

with open('data/staging/auditoria_instituicoes_expansao.json', 'r', encoding='utf-8') as fp:
    data = json.load(fp)

total = data['total_questoes']
origem = data['resumo_origem']

print("=" * 70)
print(f"ANÁLISE DAS QUESTÕES DE EXPANSÃO ({total:,} QUESTÕES)")
print("=" * 70)
print(f"• Instituições Oficiais (Bancas/Hospitais) : {origem['Oficial']:,} ({origem['Oficial']/total*100:.2f}%)")
print(f"• Questões Originais de Plataformas/Simulados: {origem['Plataforma/Inedita']:,} ({origem['Plataforma/Inedita']/total*100:.2f}%)")

print("\n" + "=" * 70)
print("DISTRIBUIÇÃO TEMPORAL (POR ANO) — OFICIAL vs PLATAFORMAS")
print("=" * 70)

all_years = sorted(list(set(list(data['anos_por_origem']['Oficial'].keys()) + list(data['anos_por_origem']['Plataforma/Inedita'].keys()))), key=lambda x: (0 if str(x).isdigit() else 1, int(x) if str(x).isdigit() else 0))

print(f"{'Ano':<12} | {'Oficial':<12} | {'Plataforma/Inédita':<20} | {'Total':<10}")
print("-" * 60)
for y in all_years:
    of = data['anos_por_origem']['Oficial'].get(str(y), 0)
    pl = data['anos_por_origem']['Plataforma/Inedita'].get(str(y), 0)
    print(f"{str(y):<12} | {of:<12,d} | {pl:<20,d} | {of+pl:<10,d}")

print("\n" + "=" * 70)
print("TOP PLATAFORMAS / QUESTÕES AUTORAIS / INÉDITAS (TOTAL: 7.789)")
print("=" * 70)
plataformas = [i for i in data['instituicoes_ranking'] if i['tipo'] == 'Plataforma/Inedita']
for p in plataformas[:25]:
    years_str = ', '.join([f"{y}: {c}" for y, c in list(p['years'].items())[:4]])
    print(f"• {p['instituicao'][:45]:<45} | Total: {p['total']:4,d} q | Anos: {years_str}")

print("\n" + "=" * 70)
print("TOP 30 INSTITUIÇÕES OFICIAIS DE EXPANSÃO (TOTAL: 118.199)")
print("=" * 70)
oficiais = [i for i in data['instituicoes_ranking'] if i['tipo'] == 'Oficial']
for o in oficiais[:30]:
    years_str = ', '.join([f"{y}: {c}" for y, c in list(o['years'].items())[:4]])
    print(f"• {o['instituicao'][:45]:<45} | Total: {o['total']:4,d} q | Anos: {years_str}")

