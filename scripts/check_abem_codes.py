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

# 1. Search by code like ABEM or TPN
res = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?code=ilike.*ABEMTESTEDEP-2025*&select=id,code,correct_answer&limit=10",
    headers=headers
)
qs = res.json()
print("Total ABEM 2025 amostrados:", len(qs))
for q in qs[:5]:
    print(q['code'], '->', repr(q['correct_answer']))

res2026 = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?code=ilike.*ABEMTESTEDEP-2026*&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,correct_answer&limit=10",
    headers=headers
)
qs2026 = res2026.json()
print("Pendencias ABEM 2026:", len(qs2026))
