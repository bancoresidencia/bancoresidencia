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

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?code=in.(SESGO-2026-CLM-34811,SESGO-2026-CLM-34812)&select=code,statement,options",
    headers=headers
)
for q in r.json():
    print(f"\n--- {q['code']} ---")
    print(q['statement'])
    print(q['options'])
