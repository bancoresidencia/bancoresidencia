import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

html = urllib.request.urlopen(urllib.request.Request('https://www.aremg.org.br/processos-atuais', headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links: {len(links)}")
for href, text in links:
    clean_text = re.sub(r'\s+', ' ', text).strip()
    if clean_text:
        print(f"  {clean_text} -> {href}")
