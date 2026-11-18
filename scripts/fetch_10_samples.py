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

# Buscar 10 questões com enunciados e alternativas de bancas reais sem gabarito
url = f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&institution=not.ilike.*Banca%20Oficial*&statement=not.is.null&select=id,institution,year,banca,especialidade,tema,statement,options&limit=10&offset=100"
r = requests.get(url, headers=headers)
questions = r.json()

with open('data/amostra_10_pendentes_reais.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Salvas {len(questions)} questoes reais!")
for i, q in enumerate(questions, 1):
    inst = q.get('institution')
    yr = q.get('year')
    esp = q.get('especialidade')
    tema = q.get('tema')
    print(f"{i}. [{inst} - {yr}] ({esp} / {tema}) - ID: {q.get('id')}")
