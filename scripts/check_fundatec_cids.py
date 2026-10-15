import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in [551, 594, 603, 604, 647, 677]:
    url = f"https://www.fundatec.org.br/portal/concursos/concurso_detalhe_novo.php?concurso={cid}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        m = re.search(r'<title>(.*?)</title>', r.text, re.I)
        title = m.group(1).strip() if m else ''
        h1 = re.findall(r'<h[12][^>]*>(.*?)</h[12]>', r.text, re.I)
        h1_txt = " | ".join(re.sub(r'<[^>]+>', '', h).strip() for h in h1[:2])
        print(f"CID {cid}: Title='{title}' | Headers='{h1_txt}'")
        # Find pdf links
        pdf_links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
        for href, text in pdf_links:
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            if any(k in clean_text.lower() or k in href.lower() for k in ['prova', 'gabarito', 'acesso', 'caderno']):
                print(f"    {clean_text} -> {href}")
    except Exception as e:
        print(f"Error {cid}: {e}")
