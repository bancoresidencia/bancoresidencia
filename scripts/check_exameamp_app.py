import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://exameamp-app.amp.org.br/', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    print("Page length:", len(html))
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    print("Links found:")
    for l in set(links):
        print("  ", l)
except Exception as e:
    print('Error:', e)
