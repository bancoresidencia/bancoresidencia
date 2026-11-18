import requests
import json

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
}

targets = [
    ('Complexo Américas', 2026),
    ('UnB/HUB', 2016),
    ('HABM', 2025),
    ('HMMSJP', 2026),
    ('Mandic', 2026),
    ('São Caetano', 2026)
]

for name, yr in targets:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*{name}*&year=eq.{yr}&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,institution,banca,year,tipo_prova,statement,options&limit=2",
        headers=headers
    )
    data = r.json()
    print(f"\n==========================================")
    print(f"🎯 {name} ({yr}): {len(data)} pendências encontradas na amostra")
    for q in data:
        print(f"  Code: {q['code']} | Banca: {q.get('banca')} | Tipo: {q.get('tipo_prova')}")
        print(f"  Statement: {q['statement'][:140]}...")
