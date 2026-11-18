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
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

updates = [
    {
        "id": "8ac0af48-59db-4ec9-9f04-ff6f224338c2",
        "num": 1,
        "payload": {
            "correct_answer": "D",
            "is_anulada": False
        },
        "desc": "Questão 1 (IGESP 2026 - Hematêmese por Varizes Esofágicas)"
    },
    {
        "id": "b71a7571-fe49-4941-8a9d-141fb5b4a3ac",
        "num": 3,
        "payload": {
            "correct_answer": "B",
            "is_anulada": False
        },
        "desc": "Questão 3 (HMTJ 2015 - Suspeita de Colecistite Aguda e Cintilografia Biliar)"
    },
    {
        "id": "4f9e73d2-cde7-444a-8c8f-add3422e48a9",
        "num": 5,
        "payload": {
            "correct_answer": "D",
            "is_anulada": True
        },
        "desc": "Questão 5 (PUC Sorocaba 2019 - Violência Sexual - Anulada Oficialmente)"
    }
]

print("=== ATUALIZANDO GABARITOS NO SUPABASE ===")
for u in updates:
    url = f"{SUPABASE_URL}/rest/v1/questions?id=eq.{u['id']}"
    r = requests.patch(url, headers=headers, json=u['payload'])
    if r.status_code in [200, 204]:
        print(f"✅ {u['desc']}: Atualizada com sucesso! Payload: {u['payload']}")
    else:
        print(f"❌ Falha ao atualizar {u['desc']}: {r.status_code} - {r.text}")
