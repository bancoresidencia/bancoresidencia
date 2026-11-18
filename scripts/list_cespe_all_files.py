import urllib.request
import re

url = 'http://www.cespe.unb.br/concursos/ses_df_16_residencia/arquivos/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        files = re.findall(r'href="([^"]+)"', html)
        print(f"Total links found: {len(files)}")
        for f in sorted(set(files)):
            if f.lower().endswith('.pdf'):
                print("  PDF:", f)
except Exception as e:
    print("Error:", e)
