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
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json'
}

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?statement=ilike.*Doença de Addison*&select=id,code,institution,year,statement,correct_answer",
    headers=headers
)
data = r.json()
print(f"Found {len(data)} questions with 'Doença de Addison' in Supabase:")
for d in data[:5]:
    print(f"Code: {d['code']} | Inst: {d['institution']} | Year: {d['year']} | Answer: {d['correct_answer']}")
