import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

html = urllib.request.urlopen(urllib.request.Request('https://www.aremg.org.br/processos-antigos', headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html)
for s in scripts:
    print("Script src:", s)

# Also check any inline JS or event handlers
print("\nLooking for field or change handler in full html:")
for line in html.split('\n'):
    if any(k in line for k in ['campo-selecao-ano', 'field', 'onchange', 'processos-antigos']):
        print("  ->", line.strip()[:150])
