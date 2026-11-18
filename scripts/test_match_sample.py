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
    f"{SUPABASE_URL}/rest/v1/questions?statement=ilike.*classifica%C3%A7%C3%A3o%20da%20press%C3%A3o%20arterial%20orienta*&select=id,code,institution,year,correct_answer",
    headers=headers
)
print("Response:", r.status_code, r.json())
