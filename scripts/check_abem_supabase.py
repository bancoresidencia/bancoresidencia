import requests
import json
import os
import sys

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

# Fetch ABEM pending questions
res = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*ABEM*&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,year,statement,options&limit=5",
    headers=headers
)
abem_qs = res.json()
print(f"ABEM pendências encontradas: {len(abem_qs)}")
for q in abem_qs:
    print("\n--- CODE:", q['code'], "Ano:", q['year'])
    print("Statement (primeiros 150 chars):")
    print(repr(q['statement'][:150]))
