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

total = 0
offset = 0
step = 1000

while True:
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f"Bearer {SERVICE_ROLE_KEY}",
        'Range': f"{offset}-{offset + step - 1}"
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.'')&select=id&order=id.asc",
        headers=headers
    )
    data = r.json()
    if not data or not isinstance(data, list):
        break
    total += len(data)
    offset += len(data)
    print(f"Loaded batch: {len(data)}, Running total: {total}")
    if len(data) < step:
        break

print(f"Final total loaded: {total}")
