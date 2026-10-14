import requests, re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import urllib3
urllib3.disable_warnings()

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    (2023, 'https://www.upenet.com.br/concursos/23_Resid_Med/RM_23_Provas_Gab.html'),
    (2022, 'https://www.upenet.com.br/concursos/22_Residencia%20Medica/RM_22_Provas_Gab.html'),
    (2021, 'https://www.upenet.com.br/concursos/2021/21_Residencia%20Medica/RM_21_Provas_Gab.html'),
    (2019, 'https://www.upenet.com.br/concursos/2019/19_Residencia%20Medica/'),
    (2018, 'https://www.upenet.com.br/concluido/2018/18_residencia_medica/residencia_medica_18_Provas_Gab.html')
]

for yr, page_url in urls:
    print(f"\n=== UPENET {yr}: {page_url} ===")
    try:
        r = requests.get(page_url, headers=headers, verify=False, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        for a in soup.find_all('a'):
            href = a.get('href', '')
            txt = a.text.strip().replace('\n', ' ')
            if href and any(k in txt.lower() or k in href.lower() for k in ['acesso direto', 'gr 01', 'gr01', 'gabarito definitivo']):
                full_link = urljoin(page_url, href)
                print(f"  [{txt[:45]}] -> {full_link}")
    except Exception as e:
        print(f"  Erro ao acessar {page_url}: {e}")
