import requests
import json
from collections import Counter

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

# Carrega 500 pendências aleatórias ou por offset
headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
}

# Top instituições com pendências
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=institution,year,banca&limit=5000",
    headers=headers
)
data = r.json()
print("Total amostrado:", len(data))
counter = Counter((d.get('institution', 'SEM_INST'), d.get('year', 'SEM_ANO')) for d in data)
print("\nTop 20 Instituição + Ano com pendências:")
for (inst, yr), count in counter.most_common(20):
    print(f"  [{count:3d} pendências] {inst} ({yr})")
