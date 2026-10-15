import requests, re, sys
from concurrent.futures import ThreadPoolExecutor
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

targets = [
    'santa casa', 'iscmsp', 'iamspe', 'sus-sp', 'sus/sp', 'secretaria da saude',
    'secretaria de estado da saude de sao paulo'
]

def check_cid(cid):
    url = f'https://quadrix.org.br/informacoes/{cid}/'
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            r.encoding = 'iso-8859-1'
            text = r.text.lower()
            for t in targets:
                if t in text:
                    # extract the title heading
                    m = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', r.text, re.I)
                    title = " | ".join([re.sub(r'<[^>]+>', '', h).strip() for h in m if len(h) > 5 and 'menu' not in h.lower() and 'candidato' not in h.lower()])
                    return cid, title
    except:
        pass
    return None

print("Varredura Quadrix CIDs 900 a 1400...")
found = []
with ThreadPoolExecutor(max_workers=25) as executor:
    results = executor.map(check_cid, range(900, 1400))
    for res in results:
        if res:
            cid, title = res
            print(f"CID {cid}: {title[:100]}")
            found.append(res)

print(f"\nTotal concursos relevantes encontrados: {len(found)}")
