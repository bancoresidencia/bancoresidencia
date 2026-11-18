import urllib.request
import re

url = 'https://www.qconcursos.com/questoes-de-concursos/questoes/d72505e1-06'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        # Extract metadata: Disciplina, Assunto, Banca, Órgão, Prova, Ano
        print("Page title:", re.findall(r'<title>(.*?)</title>', html))
        # Look for breadcrumbs or info
        info = re.findall(r'class="[^"]*(?:breadcrumb|info|details|item)[^"]*"[^>]*>(.*?)<', html)
        for i in info[:20]:
            if i.strip():
                print(" ", i.strip())
        # Also look for Ano / Banca
        meta = re.findall(r'(Ano|Banca|Órgão|Prova):\s*<[^>]+>([^<]+)<', html)
        print("Meta:", meta)
except Exception as e:
    print("Error:", e)
