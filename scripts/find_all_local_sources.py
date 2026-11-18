import os, glob, sqlite3, json

print("=== VERIFICANDO FONTES LOCAIS DE QUESTÕES ===")

# 1. Checar provaderesidencia_coleta_parte2.db
for path in ['data/provaderesidencia_coleta_parte2.db', 'provaderesidencia_coleta_parte2.db']:
    if os.path.exists(path):
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cur.fetchall()
        print(f"\n{path} ({os.path.getsize(path)/1024/1024:.1f} MB) -> Tabelas: {tables}")
        for t in tables:
            tname = t[0]
            try:
                cur.execute(f"SELECT COUNT(*) FROM [{tname}]")
                cnt = cur.fetchone()[0]
                cur.execute(f"PRAGMA table_info([{tname}])")
                cols = [c[1] for c in cur.fetchall()]
                has_ans = 'gabarito' in cols or 'correct_answer' in cols or 'resposta' in cols
                print(f"  - {tname}: {cnt} linhas, colunas: {cols[:6]}... (Tem gabarito: {has_ans})")
            except Exception as e:
                print(f"  - {tname}: erro {e}")
        conn.close()

# 2. Checar arquivos JSON grandes em data/
print("\n=== ARQUIVOS JSON GRANDES (> 500 KB) EM data/ ===")
for jf in glob.glob('data/**/*.json', recursive=True):
    sz = os.path.getsize(jf)
    if sz > 500000:
        print(f"  - {jf}: {sz/1024/1024:.2f} MB")
