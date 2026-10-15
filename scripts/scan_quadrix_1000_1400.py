import requests, re, sys
from concurrent.futures import ThreadPoolExecutor
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def check_cid(cid):
    url = f'https://quadrix.org.br/informacoes/{cid}/'
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            m = re.search(r'<h[12][^>]*>(.*?)</h[12]>', r.text, re.I | re.DOTALL)
            title = re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else ''
            text_low = r.text.lower()[:3000]
            if any(k in title.lower() or k in text_low for k in ['residência', 'residencia', 'iamspe', 'santa casa', 'médica', 'medica', 'sus-sp', 'sus/sp']):
                return cid, title
    except:
        pass
    return None

print("Varredura Quadrix CIDs 1000 a 1400...")
found = []
with ThreadPoolExecutor(max_workers=25) as executor:
    results = executor.map(check_cid, range(1000, 1400))
    for res in results:
        if res:
            cid, title = res
            print(f"CID {cid}: {title[:90]}")
            found.append(res)

print(f"\nTotal concursos médicos encontrados: {len(found)}")
