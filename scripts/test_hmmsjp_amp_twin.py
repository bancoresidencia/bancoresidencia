import sqlite3

conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

# Search statement across the entire 132k questions database
query_snippet = "%Gestante de 28 anos, G3 P2, com idade gestacional de 36 semanas e 1 dia, obesidade grau 3%"
cur.execute("SELECT code, institution, year, correct_answer FROM questions WHERE statement LIKE ?", (query_snippet,))
rows = cur.fetchall()
print(f"Total matching questions across database: {len(rows)}")
for r in rows:
    print(f"[{r[0]}] | {r[1]} | Ano: {r[2]} | Gab: '{r[3]}'")

# Also test another snippet:
query_snippet2 = "%Após uma ecografia de rotina, uma gestante de 18 semanas recebeu o diagnóstico de anencefalia fetal%"
cur.execute("SELECT code, institution, year, correct_answer FROM questions WHERE statement LIKE ?", (query_snippet2,))
rows2 = cur.fetchall()
print(f"\nTotal matching questions for anencefalia: {len(rows2)}")
for r in rows2:
    print(f"[{r[0]}] | {r[1]} | Ano: {r[2]} | Gab: '{r[3]}'")

conn.close()
