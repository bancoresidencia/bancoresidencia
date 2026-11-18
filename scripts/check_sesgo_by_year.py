import requests

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
    'Authorization': f"Bearer {SERVICE_ROLE_KEY}"
}

# Check pending SES-GO by year
for year in [2021, 2022, 2023, 2024, 2025, 2026]:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?institution=ilike.%ses-go%&year=eq.{year}&or=(correct_answer.is.null,correct_answer.eq.)&select=id",
        headers=headers
    )
    print(f"Pending SES-GO {year}: {len(r.json())}")
