import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0'}

r = requests.get('https://www.institutomais.org.br/Concursos/Encerrados', headers=headers)
# search for any mentions
matches = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r.text, re.DOTALL | re.IGNORECASE)
print(f'Total matches: {len(matches)}')
for href, txt in matches:
    clean = ' '.join(re.sub(r'<[^>]+>', ' ', txt).split())
    if any(k in clean.lower() or k in href.lower() for k in ['santa', 'misericordia', 'misericórdia', 'iscmsp', 'irmandade', 'fcmscsp', 'residencia', 'residência']):
        print(f'{clean} -> {href}')
