import requests

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

service_key = env.get('SUPABASE_SECRET_KEY') or env['SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': service_key}
if not service_key.startswith('sb_secret_'):
    headers['Authorization'] = f'Bearer {service_key}'

r = requests.get(f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/questions?code=eq.HIAEEINSTEIN-2026-CIR-9286&select=code,statement,options,correct_answer", headers=headers)
data = r.json()
print("Data:", data)
