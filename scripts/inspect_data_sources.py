import sqlite3, os, json

if os.path.exists('data/gabaritos_nacional.db'):
    con = sqlite3.connect('data/gabaritos_nacional.db')
    cur = con.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    print('Tables in gabaritos_nacional.db:', tables)
    for t in tables:
        cnt = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
        sample = cur.execute(f"SELECT * FROM {t} LIMIT 1").fetchone()
        print(f"  {t}: {cnt} rows | sample: {sample}")

print('\nTotal in all_homologated_questions_gold.json:')
if os.path.exists('data/all_homologated_questions_gold.json'):
    with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as f:
        gold = json.load(f)
    print(f"  {len(gold)} questions")
