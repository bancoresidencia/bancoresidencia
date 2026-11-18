import requests, json

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
    'Prefer': 'count=exact'
}

tables = [
    'questions',
    'questions_expansion_direto',
    'questions_expansion_r_plus',
    'questions_expansion_revalida',
    'questions_expansion_titulo_especialista'
]

print("=== CONTAGEM NAS TABELAS DO SUPABASE ===")
for t in tables:
    r_total = requests.get(f"{SUPABASE_URL}/rest/v1/{t}?select=id&limit=1", headers=headers)
    cr = r_total.headers.get('content-range', '')
    total = cr.split('/')[-1] if '/' in cr else 'erro'
    
    # missing
    r_null = requests.get(f"{SUPABASE_URL}/rest/v1/{t}?or=(correct_answer.is.null,correct_answer.eq.)&select=id&limit=1", headers=headers)
    cr_null = r_null.headers.get('content-range', '')
    missing = cr_null.split('/')[-1] if '/' in cr_null else 'erro'
    
    print(f"Tabela: {t:<40} | Total: {total:<8} | Sem gabarito: {missing}")
