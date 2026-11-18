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

# Pegar com options não nulo e type = Múltipla escolha
url = f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&especialidade=in.(Ginecologia,Obstetrícia)&type=eq.Múltipla%20escolha&statement=not.is.null&select=id,institution,year,banca,especialidade,tema,statement,options&limit=20"
r = requests.get(url, headers=headers)
rows = r.json()

valid_go = []
for q in rows:
    opts = q.get('options')
    if isinstance(opts, str):
        try:
            opts = json.loads(opts)
        except:
            opts = []
    if isinstance(opts, list) and len(opts) >= 4 and all(isinstance(x, dict) and x.get('text') for x in opts):
        q['options'] = opts
        valid_go.append(q)
    if len(valid_go) == 2:
        break

print(f"Encontradas {len(valid_go)} questoes de GO válidas:")
for q in valid_go:
    print(f"- [{q['institution']} {q['year']}] ({q['tema']})")

with open('data/amostra_10_diversas.json', 'r', encoding='utf-8') as f:
    all_10 = json.load(f)

if len(valid_go) == 2:
    all_10[4] = valid_go[0]
    all_10[5] = valid_go[1]

with open('data/amostra_10_diversas.json', 'w', encoding='utf-8') as f:
    json.dump(all_10, f, ensure_ascii=False, indent=2)

print("Atualizado com sucesso!")
