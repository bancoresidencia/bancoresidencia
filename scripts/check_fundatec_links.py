import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in [594, 604, 647, 677]:
    url = f"https://www.fundatec.org.br/portal/concursos/publicacoes_concurso.php?concurso={cid}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"=== CID {cid} (Status: {r.status_code}) ===")
        # Find links with pdf
        links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
        print(f"Total PDF links found: {len(links)}")
        for href, text in links:
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            if any(k in clean_text.lower() or k in href.lower() for k in ['prova', 'gabarito', 'acesso direto', 'caderno']):
                print(f"  {clean_text} -> {href}")
    except Exception as e:
        print(f"Error {cid}: {e}")
