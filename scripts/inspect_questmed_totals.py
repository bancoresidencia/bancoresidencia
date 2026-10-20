import json
import sqlite3
from collections import defaultdict, Counter

with open('data/questmed_all_exams_catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

print(f"Total de registros de cadernos no catalogo QuestMed: {len(cat)}")
total_questions_catalog = sum(x.get('total_questions') or 0 for x in cat)
print(f"Soma do campo total_questions no catalogo: {total_questions_catalog:,}")

por_tipo = defaultdict(list)
for x in cat:
    por_tipo[x.get('exam_type')].append(x)

for t, lista in por_tipo.items():
    soma = sum(x.get('total_questions') or 0 for x in lista)
    print(f"Tipo: {t:<15} | Registros: {len(lista):<5} | Soma total_questions declarada: {soma:,}")

# Verificar sobreposição de banca e ano entre completo e especialidade
bancas_completo = set((x.get('banca'), x.get('ano')) for x in por_tipo['completo'])
bancas_especialidade = set((x.get('banca'), x.get('ano')) for x in por_tipo['especialidade'])
inter = bancas_completo.intersection(bancas_especialidade)
print(f"Pares (banca, ano) que aparecem em AMBOS (completo E especialidade): {len(inter)}")

# Todas as combinações únicas de (banca, ano) no catálogo QuestMed
todas_bancas_anos_cat = set((x.get('banca'), x.get('ano')) for x in cat if x.get('banca') and x.get('ano'))
print(f"Total de pares unicos (banca, ano) no catalogo QuestMed: {len(todas_bancas_anos_cat)}")

# Agora inspecionar o SQLite
conn = sqlite3.connect('data/questmed_extracted_exams.db')
c = conn.cursor()

c.execute('SELECT COUNT(*) FROM questmed_questions')
total_extraido = c.fetchone()[0]
print(f"\nTotal de questoes UNICAS gravadas no SQLite: {total_extraido:,}")

c.execute('SELECT COUNT(DISTINCT id) FROM questmed_questions')
ids_unicos = c.fetchone()[0]
print(f"Total de IDs unicos no SQLite: {ids_unicos:,}")

c.execute('SELECT COUNT(DISTINCT banca || ano) FROM questmed_questions')
bancas_anos_sqlite = c.fetchone()[0]
print(f"Total de pares distintos (banca, ano) com questoes no SQLite: {bancas_anos_sqlite}")

c.execute('SELECT ano, COUNT(*) FROM questmed_questions GROUP BY ano ORDER BY ano DESC')
rows_ano = c.fetchall()
print("\nQuestoes extraidas por ano no SQLite:")
for a, cnt in rows_ano:
    print(f"  {a}: {cnt:,}")

# Verificar se ha bancas do catalogo que NAO estao no SQLite
c.execute('SELECT DISTINCT banca, ano FROM questmed_questions')
extraidas_bancas_anos = set(c.fetchall())
nao_extraidas = todas_bancas_anos_cat - extraidas_bancas_anos
print(f"\nPares (banca, ano) do catalogo NAO encontrados no SQLite: {len(nao_extraidas)}")
if nao_extraidas:
    print("Exemplos de nao extraidas (primeiras 10):", list(nao_extraidas)[:10])

# Quantas questões estavam no catálogo para essas não extraídas?
cat_nao_extraidas_sum = sum(x.get('total_questions') or 0 for x in cat if (x.get('banca'), x.get('ano')) in nao_extraidas)
print(f"Soma total_questions declarada no catalogo para as nao extraidas: {cat_nao_extraidas_sum:,}")

conn.close()
