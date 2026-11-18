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

specialties = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Ginecologia e Obstetrícia',
    'Pediatria',
    'Medicina Preventiva e Social'
]

diverse_samples = []

for esp in specialties:
    url = f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&especialidade=ilike.*{esp[:8]}*&institution=not.ilike.*Banca%20Oficial*&statement=not.is.null&select=id,institution,year,banca,especialidade,tema,statement,options&limit=2"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        diverse_samples.extend(data)

print(f"Total coletadas: {len(diverse_samples)}")
with open('data/amostra_10_diversas.json', 'w', encoding='utf-8') as f:
    json.dump(diverse_samples, f, ensure_ascii=False, indent=2)

for i, q in enumerate(diverse_samples, 1):
    print(f"{i}. [{q.get('institution')} - {q.get('year')}] ({q.get('especialidade')}) - {q.get('statement')[:60]}...")
