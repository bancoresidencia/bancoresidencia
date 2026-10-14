import requests, re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
r = requests.get('https://quadrix.org.br/informacoes/1177/', headers=headers)
print("=== CID 1177 (Santa Casa SP) ===")
anchors = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', r.text, re.DOTALL | re.IGNORECASE)
for href, text in anchors:
    t = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in href.lower() or k in t.lower() for k in ['gabarito', 'definitivo', 'prova', 'caderno', '.zip', '.rar']):
        print(f"[{t}] -> {href}")
