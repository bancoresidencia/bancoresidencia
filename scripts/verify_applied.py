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

ids = [
    ('8ac0af48-59db-4ec9-9f04-ff6f224338c2', 'Q1 - IGESP 2026'),
    ('b71a7571-fe49-4941-8a9d-141fb5b4a3ac', 'Q3 - HMTJ 2015'),
    ('4f9e73d2-cde7-444a-8c8f-add3422e48a9', 'Q5 - PUC Sorocaba 2019')
]

for qid, label in ids:
    url = f"{SUPABASE_URL}/rest/v1/questions?id=eq.{qid}&select=id,institution,year,correct_answer,is_anulada"
    r = requests.get(url, headers=headers)
    print(label, "->", r.json())
