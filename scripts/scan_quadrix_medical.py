import requests, re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in range(1150, 1350):
    try:
        url = f'https://quadrix.org.br/informacoes/{cid}/'
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            m = re.search(r'<h1[^>]*>(.*?)</h1>', r.text, re.I | re.DOTALL)
            if not m:
                m = re.search(r'<h2[^>]*>(.*?)</h2>', r.text, re.I | re.DOTALL)
            title = re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else ''
            if any(k in title.lower() or k in r.text.lower()[:3000] for k in ['residência', 'residencia', 'iamspe', 'santa casa', 'médica', 'medica', 'sus-sp']):
                print(f"CID {cid}: {title[:80]}")
    except Exception as e:
        pass
