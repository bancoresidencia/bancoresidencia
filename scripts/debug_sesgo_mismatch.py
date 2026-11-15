import requests
import json
import re

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
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*SES-GO*&or=(correct_answer.is.null,correct_answer.eq.'')&select=code,year,statement,options&limit=5",
    headers=headers
)
data = r.json()
print("Sample 5 pending SES-GO in Supabase:")
for d in data:
    print(f"Code: {d['code']} | Year: {d['year']}")
    print(f"Stmt: {d['statement']}")
    print("-" * 50)
