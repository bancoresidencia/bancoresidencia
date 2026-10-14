import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import urllib3
urllib3.disable_warnings()

class UPENETCrawler:
    """
    Crawler oficial para download de cadernos de prova e gabaritos definitivos da SES-PE
    no portal IAUPE / UPENET de 2015 a 2026.
    """

    DIRECT_TARGETS = {
        2023: {
            'prova': 'https://www.upenet.com.br/concursos/23_Resid_Med/Provas_Gab/GR%2001%20AREAS%20BASICAS%20COM%20ACESSO%20DIRETO%202023.pdf',
            'gabarito': 'https://www.upenet.com.br/concursos/23_Resid_Med/Provas_Gab/221227_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202023.pdf'
        },
        2022: {
            'prova': 'https://www.upenet.com.br/concursos/22_Residencia%20Medica/Prof_Gab/GR%2001%20AREAS%20BASICAS%20COM%20ACESSO%20DIRETO%202022.pdf',
            'gabarito': 'https://www.upenet.com.br/concursos/22_Residencia%20Medica/Prof_Gab/220202_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202022.pdf'
        },
        2021: {
            'prova': 'https://www.upenet.com.br/concursos/2021/21_Residencia%20Medica/Prof_Gab/GR%2001%20ACESSO%20DIRETO.pdf',
            'gabarito': 'https://www.upenet.com.br/concursos/2021/21_Residencia%20Medica/Prof_Gab/210202_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202021.pdf'
        },
        2020: {
            'prova': 'https://www.upenet.com.br/concursos/2020/20_Residencia%20Medica/Provas_Gab/GR%2001%20ACESSO%20DIRETO.pdf',
            'gabarito': 'https://www.upenet.com.br/concursos/2020/20_Residencia%20Medica/Provas_Gab/200117_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202020.pdf'
        },
        2019: {
            'prova': 'https://www.upenet.com.br/concursos/2019/19_Residencia%20Medica/Provas_Gab/GR%2001%20ACESSO%20DIRETO.pdf',
            'gabarito': 'https://www.upenet.com.br/concursos/2019/19_Residencia%20Medica/Provas_Gab/140119_GABARITO%20DEFINITVO%20ACESSO%20DIRETO%202019.pdf'
        },
        2018: {
            'prova': 'https://www.upenet.com.br/concluido/2018/18_residencia_medica/Provas_Gab/GR%2001%20AREAS%20BASICAS.pdf',
            'gabarito': 'https://www.upenet.com.br/concluido/2018/18_residencia_medica/Provas_Gab/271217_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202018.pdf'
        },
        2017: {
            'prova': 'https://www.upenet.com.br/concluido/2017/17_residencia_medica_17/Provas_Gab/GR%2001%20AREAS%20BASICAS.pdf',
            'gabarito': 'https://www.upenet.com.br/concluido/2017/17_residencia_medica_17/Provas_Gab/200117_GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202017.pdf'
        },
        2016: {
            'prova': 'https://www.upenet.com.br/concluido/2016/16_residencia_medica/Prova_gab/GR%2001%20AREAS%20BASICAS.pdf',
            'gabarito': 'https://www.upenet.com.br/concluido/2016/16_residencia_medica/Prova_gab/GABARITO%20DEFINITIVO%20ACESSO%20%20%20DIRETO%202016.pdf'
        },
        2015: {
            'prova': 'https://www.upenet.com.br/concluido/2015/15_residencia_medica_15/provas_gabaritos/GR%2001%20AREAS%20BASICAS.pdf',
            'gabarito': 'https://www.upenet.com.br/concluido/2015/15_residencia_medica_15/GABARITOS/GABARITO%20DEFINITIVO%20ACESSO%20DIRETO%202015.pdf'
        }
    }

    def __init__(self, dest_dir='data/official_exams/SES_PE'):
        self.dest_dir = dest_dir
        os.makedirs(self.dest_dir, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.session.verify = False

    def download_direct_targets(self):
        downloaded = []
        for yr, targets in sorted(self.DIRECT_TARGETS.items(), reverse=True):
            print(f"\n[SES-PE {yr}] Baixando Prova e Gabarito...")
            for tipo, url in targets.items():
                target_fn = f"SES_PE_{yr}_{tipo.upper()}_ACESSO_DIRETO.pdf"
                target_path = os.path.join(self.dest_dir, target_fn)
                if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
                    print(f"  [OK Já existe] {target_fn}")
                    downloaded.append((yr, tipo, target_path))
                    continue

                print(f"  -> Baixando {tipo}: {url}")
                try:
                    r = self.session.get(url, timeout=25)
                    if r.status_code == 200 and len(r.content) > 1000:
                        with open(target_path, 'wb') as fp:
                            fp.write(r.content)
                        print(f"     Salvo com sucesso: {target_fn} ({len(r.content):,} bytes)")
                        downloaded.append((yr, tipo, target_path))
                    else:
                        print(f"     Falha HTTP {r.status_code} ({len(r.content)} bytes)")
                except Exception as e:
                    print(f"     Erro: {e}")
        return downloaded

if __name__ == '__main__':
    crawler = UPENETCrawler()
    res = crawler.download_direct_targets()
    print(f"\nTotal processados/baixados: {len(res)}")
