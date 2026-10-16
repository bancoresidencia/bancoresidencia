"""
Piloto de Extração Controlada de Gabarito por Prova Específica
Respeita intervalo de requisição (rate limiting) para evitar sobrecarga.
"""
import urllib.request
import urllib.parse
import http.cookiejar
import base64
import json
import time
from bs4 import BeautifulSoup

def extract_exam_answer_keys(prova_id, prova_slug, max_questions=10, delay_seconds=0.8):
    base_url = "https://provaderesidencia.com.br"
    overview_url = f"{base_url}/demo/prova/{prova_id}/{prova_slug}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    print(f"[*] Acessando visão geral da prova: {overview_url}")
    req = urllib.request.Request(overview_url, headers=headers)
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"[!] Erro ao acessar prova: {e}")
        return None
        
    soup = BeautifulSoup(html, 'html.parser')
    
    # Coletar links das questões
    q_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        text = a.get_text(strip=True)
        if '/demo/questao/' in href and text.isdigit():
            q_num = int(text)
            q_links.append((q_num, f"{base_url}{href}"))
            
    q_links.sort(key=lambda x: x[0])
    print(f"[*] Total de questões identificadas na prova: {len(q_links)}")
    
    if max_questions:
        q_links = q_links[:max_questions]
        print(f"[*] Executando lote piloto com as primeiras {len(q_links)} questões...")
        
    results = []
    
    for q_num, q_url in q_links:
        cookie_jar = http.cookiejar.CookieJar()
        opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
        
        try:
            q_req = urllib.request.Request(q_url, headers=headers)
            q_html = opener.open(q_req).read().decode('utf-8', errors='replace')
            q_soup = BeautifulSoup(q_html, 'html.parser')
            
            # 1. Obter alternativas do HTML
            choice_map = {}
            for label in q_soup.find_all('label'):
                inp = label.find('input', {'name': 'choice'})
                if inp:
                    val = inp['value']
                    txt = label.get_text(strip=True)
                    # Letra da alternativa (A, B, C, D)
                    letter = txt[:2].replace(')', '').strip().upper()
                    choice_map[val] = letter
                    
            # 2. Obter gabarito via cookie sessionid
            correct_id = None
            for c in cookie_jar:
                if c.name == 'sessionid' and ':' in c.value:
                    b64 = c.value.split(':')[0]
                    padded = b64 + '=' * (-len(b64) % 4)
                    try:
                        decoded = json.loads(base64.b64decode(padded).decode('utf-8'))
                        # estrutura: {"1342": {"109174": {"c": null, "r": 494676}}}
                        for pid, pdata in decoded.items():
                            for qid, qdata in pdata.items():
                                if 'r' in qdata:
                                    correct_id = str(qdata['r'])
                    except Exception:
                        pass
                        
            correct_letter = choice_map.get(correct_id, "Desconhecido")
            results.append({
                "numero": q_num,
                "url": q_url,
                "choice_id_correto": correct_id,
                "gabarito_oficial": correct_letter
            })
            print(f"  -> Questão {q_num:02d}: Gabarito Oficial = [{correct_letter}]")
            
        except Exception as err:
            print(f"  [!] Falha na questão {q_num}: {err}")
            
        # Respeitar rate limit
        time.sleep(delay_seconds)
        
    return results

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    # Exemplo: Prova ABC - SP 2019 (ID 1342) - Piloto 5 questões
    gabaritos = extract_exam_answer_keys(1342, "abc-sp-2019-r1-1", max_questions=5, delay_seconds=0.5)
    print("\n[OK] Resultado estruturado da amostragem:")
    print(json.dumps(gabaritos, indent=2, ensure_ascii=False))
