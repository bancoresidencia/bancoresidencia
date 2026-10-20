import csv
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/relatorio_provas_instituicoes_ano.csv', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    by_year = {}
    for r in reader:
        ano = int(r['ano']) if r['ano'] else 0
        if ano not in by_year:
            by_year[ano] = {'provas': 0, 'total': 0, 'gab': 0, 'anul': 0, 'disc': 0, 'faltam': 0}
        by_year[ano]['provas'] += 1
        by_year[ano]['total'] += int(r['total_questoes_unicas'])
        by_year[ano]['gab'] += int(r['com_gabarito_valido'])
        by_year[ano]['anul'] += int(r['anuladas_oficiais'])
        by_year[ano]['disc'] += int(r['discursivas_segunda_fase'])
        by_year[ano]['faltam'] += int(r['faltam_gabaritos'])

status_map = {
    2027: "🟡 Em captação inicial",
    2026: "🟡 Safra recente em homologação",
    2025: "🟡 Curadoria em andamento",
    2024: "🟡 Em consolidação",
    2023: "🟡 Prioridade de importação",
    2022: "🟡 Prioridade de importação",
    2021: "🟡 Prioridade de importação",
    2020: "🟢 Boa cobertura",
    2019: "✅ Praticamente blindado",
    2018: "✅ Praticamente blindado",
    2017: "✅ Praticamente blindado",
    2016: "🟢 Alta densidade",
    2015: "🟢 Boa densidade",
    2014: "🟢 Histórico estável",
    2013: "🟢 Histórico estável",
    2012: "🟡 Histórico parcial",
    2011: "🟡 Histórico parcial",
    2010: "✅ Histórico blindado"
}

print("| Ano | Provas | Questões Únicas | Gabaritos Válidos | Anuladas | Discursivas | Faltantes | % Cobertura | Status Dominante |")
print("| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |")
for ano in sorted(by_year.keys(), reverse=True):
    y = by_year[ano]
    pct = (y['gab'] + y['anul'] + y['disc']) / y['total'] * 100 if y['total'] > 0 else 0
    st = status_map.get(ano, "—")
    print(f"| **{ano}** | {y['provas']} | {y['total']:,} | {y['gab']:,} | {y['anul']:,} | {y['disc']:,} | {y['faltam']:,} | **{pct:.1f}%** | {st} |")
