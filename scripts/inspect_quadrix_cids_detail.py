import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
cids = [1174, 1177, 1213, 1214, 1242, 1243, 1297, 1324, 1371, 1372]

for cid in cids:
    url = f'https://quadrix.org.br/informacoes/{cid}/'
    r = requests.get(url, headers=headers)
    r.encoding = 'iso-8859-1'
    # Find h2 or h3 or strong that has the year / concurso name
    matches = re.findall(r'<div class="box-body"[^>]*>(.*?)</div>', r.text, re.I | re.DOTALL)
    print(f"\n================ CID {cid} ================")
    # Extract headers
    h = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', r.text, re.I)
    print("Headers:", " | ".join([re.sub(r'<[^>]+>', '', x).strip() for x in h if 'menu' not in x.lower() and 'candidato' not in x.lower()]))
    # Extract publications
    # In quadrix, publications are loaded via ajax or embedded
    pub_links = re.findall(r'href=["\']([^"\']+\.(?:pdf|zip|rar))["\'][^>]*>(.*?)</a>', r.text, re.I)
    print(f"Direct publication links: {len(pub_links)}")
    for link, name in pub_links[:5]:
        print(f"  {re.sub(r'<[^>]+>', '', name).strip()} -> {link}")
