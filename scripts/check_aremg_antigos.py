import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.aremg.org.br/processos-antigos'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
    print(f"Total links on processos-antigos: {len(links)}")
    for href, text in links:
        clean_text = re.sub(r'<[^>]+>', ' ', text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        if clean_text and clean_text.lower() not in ['home', 'aremg', 'cursos', 'enquete', 'processo seletivo', 'notcias', 'notícias', 'links teis', 'links úteis', 'contato']:
            print(f"  {clean_text} -> {href}")
except Exception as e:
    print("Error:", e)
