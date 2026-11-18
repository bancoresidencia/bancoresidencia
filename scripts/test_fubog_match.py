import requests, json
import sys
sys.path.append('.')
from scripts.run_fase1_pdf_universal import SUPABASE_URL, SERVICE_ROLE_KEY, dice_similarity, parse_prova, parse_gabarito

headers = {'apikey': SERVICE_ROLE_KEY, 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'}
res = requests.get(f'{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&institution=ilike.*FUBOG*&select=id,code,statement,options', headers=headers)
pendencias = res.json()
print('Pendencias FUBOG no Supabase:', len(pendencias))

pv = parse_prova('data/incoming_exams/FUBOG/PV_FUBOG_VERSAO_1A.pdf')
gb = parse_gabarito('data/incoming_exams/FUBOG/GB_FUBOG_VERSAO_1A.pdf')

matches = 0
for p in pendencias:
    for q_num, q_data in pv.items():
        sim = dice_similarity(p['statement'], q_data['statement'])
        if sim >= 0.7:
            print(f"Match: {p['code']} vs Q{q_num}: {sim*100:.0f}%")
            matches += 1
print('Total matches >= 70%:', matches)
if matches == 0 and len(pendencias) > 0 and len(pv) > 0:
    print("\nExemplo enunciado pendencia Supabase:")
    print(pendencias[0]['code'], ":", pendencias[0]['statement'][:200])
    print("\nExemplo enunciado PDF FUBOG Q1:")
    print("Q1:", pv.get(1, {}).get('statement', '')[:200])
