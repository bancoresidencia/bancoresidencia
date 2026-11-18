import sqlite3
import json

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
c = conn.cursor()

# Check distribution of commentary_tier in staging
c.execute("""
SELECT especialidade, commentary_tier, count(*) 
FROM questions_curated_staging 
GROUP BY especialidade, commentary_tier
""")
sqlite_stats = {}
for esp, tier, count in c.fetchall():
    if esp not in sqlite_stats:
        sqlite_stats[esp] = {}
    sqlite_stats[esp][tier] = count

print("SQLite questions_curated_staging commentary_tier:")
for esp, tiers in sorted(sqlite_stats.items()):
    print(f"  {esp:30}: Ouro={tiers.get('padrao_ouro', 0):6d} | Legado={tiers.get('comentada', 0):6d} | Sem={tiers.get('sem_comentario', 0):6d} | Total={sum(tiers.values()):6d}")
