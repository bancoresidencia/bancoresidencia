import sys, requests, json
sys.path.append('.')
from scripts.run_fase1_pdf_universal import SUPABASE_URL, SERVICE_ROLE_KEY
from collections import Counter

headers = {'apikey': SERVICE_ROLE_KEY, 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'}
r = requests.get(f'{SUPABASE_URL}/rest/v1/questions?institution=ilike.*Goi%C3%A1s*&year=eq.2026&or=(correct_answer.is.null,correct_answer.eq.)&select=code,especialidade,statement', headers=headers)
data = r.json()
print(f'SES-GO 2026 pendencias: {len(data)}')
print('Por especialidade:', Counter(q['especialidade'] for q in data))
for q in data[:10]:
    code = q.get('code', '')
    esp = q.get('especialidade', '')
    st = (q.get('statement') or '')[:80].replace('\n', ' ')
    print(f"{code} | {esp} | {st}")
