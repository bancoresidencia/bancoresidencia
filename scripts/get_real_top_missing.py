import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

query = """
SELECT institution, count(*) as missing_count
FROM questions
WHERE correct_answer IS NULL OR correct_answer = ''
GROUP BY institution
ORDER BY missing_count DESC
LIMIT 20
"""

cur.execute(query)
rows = cur.fetchall()
print("=== TOP 20 INSTITUIÇÕES COM GABARITO FALTANDO NO BANCO ===")
total_top20 = 0
for i, r in enumerate(rows):
    print(f"{i+1:2d}. {r[0]}: {r[1]} pendentes")
    total_top20 += r[1]

print(f"\nTotal concentrado no Top 20: {total_top20}")
conn.close()
