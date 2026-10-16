import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://med.estrategia.com/portal/residencia-medica/provas/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
    print(f"Total links: {len(links)}")
    for href, text in links:
        clean = re.sub(r'<[^>]+>', ' ', text).strip()
        if any(k in href.lower() or k in clean.lower() for k in ['psu', 'amp', 'uerj', 'unicamp', 'ses-go', 'hcpa', 'ufrgs', 'cops', 'uel']):
            print(f"  [{clean}] -> {href}")
except Exception as e:
    print("Error:", e)
