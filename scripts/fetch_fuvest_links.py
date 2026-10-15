import re
import urllib.request

url = 'https://www.fuvest.br/residencia-medica-provas-e-gabarito/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    # find all links
    links = set(re.findall(r'href=[\'"]([^\'"]+)[\'"]', html))
    pdf_links = [l for l in links if l.lower().endswith('.pdf')]
    print(f"Total PDF links found: {len(pdf_links)}")
    for l in sorted(pdf_links):
        print(l)
except Exception as e:
    print("Error:", e)
