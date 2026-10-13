import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import urllib3
urllib3.disable_warnings()

class UFPACrawler:
    BASE_URL = "https://www.ceps.ufpa.br"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.session.verify = False

    def get_soup(self, url):
        try:
            r = self.session.get(url, timeout=15)
            if r.status_code == 200:
                return BeautifulSoup(r.text, 'html.parser')
        except Exception as e:
            print(f"[UFPA Crawler] Erro ao acessar {url}: {e}")
        return None

    def discover_editions(self):
        """Descobre todas as edições do PSRM disponíveis no portal CEPS"""
        soup = self.get_soup(self.BASE_URL)
        if not soup:
            return []

        editions = []
        for a in soup.find_all('a'):
            href = a.get('href', '')
            text = a.text.strip().lower()
            if any(k in href.lower() or k in text for k in ['resmedica', 'medica20', 'psrm']):
                full_url = urljoin(self.BASE_URL, href)
                # Extrai ano se houver
                year_match = re.search(r'202\d', href) or re.search(r'202\d', text)
                year = int(year_match.group(0)) if year_match else None
                editions.append({
                    'url': full_url,
                    'text': a.text.strip(),
                    'year': year
                })
        # Remove duplicados por URL
        unique = []
        seen = set()
        for ed in editions:
            if ed['url'] not in seen:
                seen.add(ed['url'])
                unique.append(ed)
        return unique

    def discover_pdfs_for_edition(self, edition_url, default_year=None):
        """Varre a página da edição em busca de provas e gabaritos"""
        soup = self.get_soup(edition_url)
        if not soup:
            return []

        # Procura sub-páginas de "provas e gabaritos" ou links diretos
        subpages = []
        direct_pdfs = []

        for a in soup.find_all('a'):
            href = a.get('href', '')
            text = a.text.strip()
            full_url = urljoin(self.BASE_URL, href)

            if href.lower().endswith('.pdf'):
                direct_pdfs.append((full_url, text))
            elif any(k in text.lower() or k in href.lower() for k in ['prova', 'gabarito', 'objetiva']):
                subpages.append(full_url)

        # Se encontrou sub-páginas, visita cada uma
        found_docs = []
        visited_sub = set()

        for sp in subpages:
            if sp in visited_sub or sp == edition_url:
                continue
            visited_sub.add(sp)
            sub_soup = self.get_soup(sp)
            if not sub_soup:
                continue
            
            # Pode haver mais um nível (ex: página de publicação de gabarito)
            for a in sub_soup.find_all('a'):
                h = a.get('href', '')
                t = a.text.strip()
                f_url = urljoin(self.BASE_URL, h)
                if h.lower().endswith('.pdf'):
                    direct_pdfs.append((f_url, t))
                elif any(k in t.lower() or k in h.lower() for k in ['gabaritos-definitivo', 'gabarito-preliminar', 'provas-gabaritos']):
                    # 2º nível
                    sub2_soup = self.get_soup(f_url)
                    if sub2_soup:
                        for a2 in sub2_soup.find_all('a'):
                            h2 = a2.get('href', '')
                            t2 = a2.text.strip()
                            if h2.lower().endswith('.pdf'):
                                direct_pdfs.append((urljoin(self.BASE_URL, h2), t2))

        # Classifica e estrutura os PDFs encontrados
        seen_pdf_urls = set()
        for pdf_url, link_text in direct_pdfs:
            if pdf_url in seen_pdf_urls:
                continue
            seen_pdf_urls.add(pdf_url)

            filename = pdf_url.split('/')[-1]
            # Determina tipo de documento
            fn_lower = filename.lower()
            lt_lower = link_text.lower()
            comb = fn_lower + " " + lt_lower

            tipo_doc = 'outro'
            if 'definitivo' in comb:
                tipo_doc = 'gabarito_definitivo'
            elif 'preliminar' in comb:
                tipo_doc = 'gabarito_preliminar'
            elif 'retifica' in comb:
                tipo_doc = 'retificacao'
            elif 'prova' in comb:
                tipo_doc = 'caderno_prova'

            # Modalidade
            modalidade = 'Acesso Direto'
            if 'cirurgia' in comb:
                modalidade = 'R+ Cirurgia Geral'
            elif 'clinica' in comb:
                modalidade = 'R+ Clínica Médica'
            elif 'pediatria' in comb:
                modalidade = 'R+ Pediatria'
            elif 'ginecologia' in comb or 'obstetricia' in comb:
                modalidade = 'R+ Ginecologia e Obstetrícia'

            # Ano
            ym = re.search(r'202\d', pdf_url) or (re.search(r'202\d', str(default_year)) if default_year else None)
            ano = int(ym.group(0)) if ym else default_year

            found_docs.append({
                'nome_arquivo': filename,
                'url_origem': pdf_url,
                'ano': ano,
                'processo_seletivo': f"PSRM UFPA {ano or ''}".strip(),
                'modalidade': modalidade,
                'tipo_documento': tipo_doc,
                'descricao': link_text
            })

        return found_docs
