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

# HOA 2026
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*HOA*&year=eq.2026&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,institution,statement,options&limit=5",
    headers=headers
)
print("=== HOA 2026 Sample Questions ===")
for q in r.json():
    print(f"Code: {q['code']}")
    print(f"Statement: {q['statement'][:120]}")

# CEPOA 2026
r2 = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.*CEPOA*&year=eq.2026&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,institution,statement,options&limit=5",
    headers=headers
)
print("\n=== CEPOA 2026 Sample Questions ===")
for q in r2.json():
    print(f"Code: {q['code']}")
    print(f"Statement: {q['statement'][:120]}")
