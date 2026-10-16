import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.cops.uel.br/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    print(f"Total links: {len(links)}")
    for l in list(set(links))[:35]:
        print("  ", l)
except Exception as e:
    print("Error:", e)
