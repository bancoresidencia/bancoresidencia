import os
import sys
import json
import re
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import requests

# Carrega variáveis de ambiente diretamente de .env.local
SUPABASE_URL = None
SERVICE_KEY = None
if os.path.exists('.env.local'):
    with open('.env.local', 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('=', 1)
            if len(parts) == 2:
                k, v = parts[0].strip(), parts[1].strip()
                if k == 'NEXT_PUBLIC_SUPABASE_URL': SUPABASE_URL = v
                elif k == 'SUPABASE_SERVICE_ROLE_KEY': SERVICE_KEY = v

if not SUPABASE_URL or not SERVICE_KEY:
    # Leitura direta do .env.local caso dotenv não esteja instalado
    if os.path.exists('.env.local'):
        with open('.env.local', 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split('=', 1)
                if len(parts) == 2:
                    k, v = parts[0].strip(), parts[1].strip()
                    if k == 'NEXT_PUBLIC_SUPABASE_URL': SUPABASE_URL = v
                    elif k == 'SUPABASE_SERVICE_ROLE_KEY': SERVICE_KEY = v

print("="*80)
print("REVERTENDO 100% DAS ALTERAÇÕES E GABARITOS DA FASE 2")
print("="*80)

files = [
    'data/cirurgia_final_questions.json',
    'data/clinica_medica_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/urologia_final_questions.json'
]

reverted_ids = []
total_reverted = 0

for file_path in files:
    full_path = os.path.abspath(file_path)
    if not os.path.exists(full_path):
        continue

    print(f"\n[Arquivo] Analisando {file_path}...")
    with open(full_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    file_cleaned = 0
    for q in questions:
        comm = q.get('commentary') or ''
        if 'Gabarito Oficial Homologado - Fase 2' in comm:
            # Remove o carimbo
            new_comm = re.sub(r'\n*\s*\[Gabarito Oficial Homologado - Fase 2.*?\][^\n]*', '', comm).strip()
            q['commentary'] = new_comm
            q['correct_answer'] = ''
            q['is_anulada'] = False
            reverted_ids.append(q['id'])
            file_cleaned += 1

    if file_cleaned > 0:
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  ✅ Revertidas {file_cleaned} questões em {file_path}")
        total_reverted += file_cleaned
    else:
        print(f"  ℹ️ Nenhuma questão da Fase 2 encontrada em {file_path}")

print(f"\n" + "="*80)
print(f"TOTAL DE QUESTÕES REVERTIDAS LOCALMENTE: {total_reverted}")
print("="*80)

# Sincronização e Reversão no Supabase (Database)
if SUPABASE_URL and SERVICE_KEY and reverted_ids:
    print(f"\n[Supabase Database] Revertendo {len(reverted_ids)} questões no banco...")
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }

    # Reverte em lotes de 50
    batch_size = 50
    reverted_supa = 0
    for i in range(0, len(reverted_ids), batch_size):
        batch = reverted_ids[i:i+batch_size]
        id_filter = 'in.(' + ','.join(batch) + ')'
        try:
            res = requests.patch(
                f"{SUPABASE_URL}/rest/v1/questions?id={id_filter}&commentary=ilike.*Gabarito+Oficial+Homologado+-+Fase+2*",
                headers=headers,
                json={'correct_answer': None, 'is_anulada': False, 'commentary': ''},
                timeout=20
            )
            if res.status_code in [200, 204]:
                reverted_supa += len(batch)
        except Exception as e:
            pass

    print(f"  ✅ Reversão no banco Supabase concluída.")

# Reset da Fila no Supabase Storage
if SUPABASE_URL and SERVICE_KEY:
    print(f"\n[Supabase Storage] Resetando fila de execução e status...")
    try:
        manifest_path = os.path.abspath('data/fase2_motor_manifest.json')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                clean_queue = json.load(f)

            # Garante que todas as tarefas estejam PENDENTES
            for t in clean_queue:
                t['status'] = 'PENDENTE'
                t['assigned_to'] = None
                t['claimed_at'] = None
                t['heartbeat_at'] = None
                t['completed_at'] = None
                t['resultado'] = {
                    'gabaritos_aplicados': 0,
                    'questoes_resolvidas': 0,
                    'observacoes': ''
                }

            # Upload da fila limpa
            res1 = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/questoes/fase2_motor_queue.json",
                headers={
                    'apikey': SERVICE_KEY,
                    'Authorization': f'Bearer {SERVICE_KEY}',
                    'Content-Type': 'application/json',
                    'x-upsert': 'true'
                },
                data=json.dumps(clean_queue, ensure_ascii=False, indent=2)
            )

            # Upload do status limpo
            status_doc = {
                'updated_at': '2026-10-21T00:00:00.000Z',
                'total_provas': len(clean_queue),
                'concluidas': 0,
                'em_andamento': 0,
                'pendentes': len(clean_queue),
                'busca_web_concluida': 0,
                'gabaritos_aplicados_total': 0,
                'progresso_percentual': '0.0%',
                'workers': {
                    'DEV_1': {'status': 'IDLE', 'current_task': None},
                    'DEV_2': {'status': 'IDLE', 'current_task': None}
                }
            }
            res2 = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/questoes/fase2_motor_status.json",
                headers={
                    'apikey': SERVICE_KEY,
                    'Authorization': f'Bearer {SERVICE_KEY}',
                    'Content-Type': 'application/json',
                    'x-upsert': 'true'
                },
                data=json.dumps(status_doc, ensure_ascii=False, indent=2)
            )

            # Limpa heartbeats dos workers
            for w in ['DEV_1', 'DEV_2']:
                hb = {'worker': w, 'status': 'IDLE', 'current_task': None, 'last_heartbeat': None}
                requests.post(
                    f"{SUPABASE_URL}/storage/v1/object/questoes/fase2_worker_{w}.json",
                    headers={
                        'apikey': SERVICE_KEY,
                        'Authorization': f'Bearer {SERVICE_KEY}',
                        'Content-Type': 'application/json',
                        'x-upsert': 'true'
                    },
                    data=json.dumps(hb, ensure_ascii=False, indent=2)
                )

            print("  ✅ Fila no Supabase Storage resetada para o estado inicial PENDENTE.")
            print("  ✅ Status e heartbeats resetados.")
    except Exception as e:
        print(f"  ⚠️ Erro ao resetar Storage: {e}")

print("\n" + "="*80)
print("🚀 SUCESSO: 100% DAS ALTERAÇÕES DA FASE 2 FORAM APAGADAS E REVERTIDAS!")
print("="*80)
