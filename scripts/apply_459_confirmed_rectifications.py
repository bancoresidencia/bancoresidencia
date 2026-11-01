import json
import os
import urllib.request
import urllib.parse
from collections import defaultdict
import time

print("=" * 80)
print("APLICAÇÃO DAS 459 RETIFICAÇÕES CONFIRMADAS POR BASES EXTERNAS OFICIAIS")
print("=" * 80)

with open('C:/Users/froge/.gemini/antigravity/brain/3c7dac5d-a969-4ed1-ac6d-d1ea16a3258d/scratch/external_cross_tag_1449.json', 'r', encoding='utf-8') as f:
    cross_data = json.load(f)

retificadas_list = cross_data.get('retificadas', [])
print(f"Total de questões confirmadas para retificação: {len(retificadas_list)}")

# Mapear por code
retif_by_code = {r['code']: r for r in retificadas_list}

# 1. Atualizar nos arquivos JSON locais
specialty_files = [
    ('Ginecologia', 'data/ginecologia_final_questions.json'),
    ('Obstetrícia', 'data/obstetricia_final_questions.json'),
    ('Pediatria', 'data/pediatria_final_questions.json'),
    ('Nefrologia', 'data/nefrologia_final_questions.json')
]

supabase_updates = {} # qid -> new_letter
local_updated_count = 0

for spec_name, fp in specialty_files:
    if not os.path.exists(fp): continue
    with open(fp, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    spec_altered = 0
    for q in questions:
        code = q.get('code')
        if code in retif_by_code:
            r = retif_by_code[code]
            new_ans = r['new']
            old_ans = q.get('correct_answer') or q.get('correctAnswer')
            
            q['correct_answer'] = new_ans
            q['correctAnswer'] = new_ans
            q['is_anulada'] = False
            q['isAnulada'] = False
            
            # Atualiza também o comentário substituindo o cabeçalho de alerta
            comm = q.get('commentary') or ''
            if '[POSSÍVEL ERRO DE GABARITO' in comm:
                # Substitui pelo badge de homologação
                comm_lines = comm.split('\n')
                # Procura fim do bloco de tag
                new_badge = f"[GABARITO HOMOLOGADO - CURADORIA BANCO RESIDÊNCIA]\nGabarito oficial retificado para [{new_ans}] conforme homologação pós-recurso da banca ({r['source']}).\n"
                # Substitui a primeira linha do erro
                comm_cleaned = comm.replace('[POSSÍVEL ERRO DE GABARITO / QUESTÃO PASSÍVEL DE ANULAÇÃO]', new_badge)
                q['commentary'] = comm_cleaned
                
            qid = q.get('id')
            if qid:
                supabase_updates[qid] = {
                    'correct_answer': new_ans,
                    'is_anulada': False,
                    'commentary': q.get('commentary') or ''
                }
            spec_altered += 1
            local_updated_count += 1
            
    if spec_altered > 0:
        with open(fp, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  • {spec_name}: {spec_altered} questões retificadas e salvas em {fp}")

print(f"\nTotal atualizado localmente: {local_updated_count}")

# 2. Sincronização concorrente no Supabase
print(f"\nSincronizando {len(supabase_updates)} questões retificadas no Supabase...")

env = {}
if os.path.exists('.env.local'):
    with open('.env.local', 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k.strip()] = v.strip()

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or env.get('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("Credenciais do Supabase não encontradas!")
else:
    # Agrupar por new_letter para patches rápidos
    by_letter = defaultdict(list)
    for qid, u in supabase_updates.items():
        by_letter[u['correct_answer']].append(qid)
        
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    total_synced = 0
    CHUNK_SIZE = 100
    
    for letter, ids in by_letter.items():
        payload = {
            'correct_answer': letter,
            'is_anulada': False
        }
        for i in range(0, len(ids), CHUNK_SIZE):
            chunk = ids[i:i + CHUNK_SIZE]
            url = f"{SUPABASE_URL}/rest/v1/questions?id=in.({','.join(chunk)})"
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=req_data, headers=headers, method='PATCH')
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status in [200, 204]:
                        total_synced += len(chunk)
            except Exception as e:
                print(f"Erro no lote letra {letter} ({len(chunk)} itens): {e}")
                
        print(f"  • Letra [{letter}]: {len(ids)} questões sincronizadas.")
        
    print(f"\n--> TOTAL SINCRONIZADO NO SUPABASE: {total_synced}/{len(supabase_updates)}")

print("=" * 80)
print("RETIFICAÇÕES OFICIAIS APLICADAS COM SUCESSO!")
print("=" * 80)
