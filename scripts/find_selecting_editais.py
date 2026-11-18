import requests
import re

for edital_id in range(15, 45):
    url = f"https://portal.concursos.selecting.com.br/edital/ver/{edital_id}"
    try:
        r = requests.get(url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200:
            m = re.search(r'<title>(.*?)</title>', r.text, re.IGNORECASE)
            title = m.group(1).strip() if m else ''
            h1 = re.findall(r'<h[12][^>]*>(.*?)</h[12]>', r.text)
            clean_h1 = [re.sub(r'<[^>]+>', '', x).strip() for x in h1 if x.strip()]
            if 'fubog' in r.text.lower() or 'residência' in r.text.lower() or 'médica' in r.text.lower():
                print(f"Edital {edital_id}: {title} | {' / '.join(clean_h1[:2])}")
    except:
        pass
