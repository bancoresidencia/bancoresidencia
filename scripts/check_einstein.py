import requests

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

headers = {
    'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
    'Authorization': f"Bearer {env['SUPABASE_SERVICE_ROLE_KEY']}"
}

r = requests.get(f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/questions?code=eq.HIAEEINSTEIN-2026-CIR-9286&select=code,statement,options,correct_answer", headers=headers)
data = r.json()
print("Data:", data)
