import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

r = requests.get('https://quadrix.org.br/informacoes/1177/', headers={'User-Agent': 'Mozilla/5.0'})
r.encoding = 'iso-8859-1'
headings = re.findall(r'<h\d[^>]*>(.*?)</h\d>', r.text, re.I)
print("Headings:", [re.sub(r'<[^>]+>', '', h).strip() for h in headings])

strongs = re.findall(r'<strong[^>]*>(.*?)</strong>', r.text, re.I)
print("Strongs:", [re.sub(r'<[^>]+>', '', s).strip() for s in strongs[:5]])

pdfs = re.findall(r'href=["\']([^"\']+\.pdf)["\']', r.text, re.I)
print(f"PDFs found ({len(pdfs)}):")
for p in pdfs[:10]:
    print(" ", p)
