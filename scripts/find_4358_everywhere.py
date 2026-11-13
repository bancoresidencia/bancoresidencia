import sqlite3
import json
import glob
import os

print("--- PROCURANDO 4358 OU REVALIDA NOS BANCOS LOCAIS ---")

# 1. Checar data/provaderesidencia_coleta_parte2.db
for db in glob.glob("data/**/*.db", recursive=True):
    try:
        c = sqlite3.connect(db)
        tables = [t[0] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        for t in tables:
            # Checar colunas
            cols = [col[1] for col in c.execute(f"PRAGMA table_info({t})").fetchall()]
            for col in cols:
                try:
                    res = c.execute(f"SELECT count(*) FROM {t} WHERE lower({col}) LIKE '%revalida%'").fetchone()[0]
                    if res > 0:
                        print(f"[{db}] [{t}.{col}] LIKE '%revalida%': {res}")
                except:
                    pass
        c.close()
    except Exception as e:
        print(f"Erro ao abrir {db}: {e}")

# 2. Checar se há menção a 4358 nos logs de coleta
for log in glob.glob("data/**/*.log", recursive=True):
    with open(log, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()
        if "4358" in txt or "4.358" in txt:
            print(f"Encontrado 4358 em {log}!")

