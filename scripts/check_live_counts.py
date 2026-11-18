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
    'Authorization': f"Bearer {env['SUPABASE_SERVICE_ROLE_KEY']}",
    'Prefer': 'count=exact'
}

r1 = requests.get(f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/questions?select=id&limit=1", headers=headers)
tot = int(r1.headers.get('content-range', '0-0/0').split('/')[1])

r2 = requests.get(f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=id&limit=1", headers=headers)
pend = int(r2.headers.get('content-range', '0-0/0').split('/')[1])

with_ans = tot - pend
pct = (with_ans / tot) * 100

print(f"Supabase Total: {tot}")
print(f"Supabase Com Gabarito: {with_ans} ({pct:.2f}%)")
print(f"Supabase Pendentes: {pend}")
