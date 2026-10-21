import time
import json
import re
import sys
import os
from bs4 import BeautifulSoup
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

sys.path.insert(0, os.path.abspath('.'))

from scripts.coletor_provaderesidencia.config import (
    COOKIES, HEADERS, URL_BASE_PROVA, URL_BASE_QUESTAO
)
from scripts.coletor_provaderesidencia.db import (
    init_db, save_questao, update_prova_status, get_connection
)
from scripts.coletor_provaderesidencia.collector import extrair_questao, create_session

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def scrape_exam(p_id):
    init_db()
    session = create_session()
    conn = get_connection()
    
    prova_url = URL_BASE_PROVA.format(id=p_id)
    print(f"[Web Scraper PDR] Acessando prova online #{p_id} ({prova_url})...")
    
    try:
        res = session.get(prova_url, timeout=25)
        if res.status_code != 200:
            print(f"❌ Erro HTTP {res.status_code} ao acessar prova #{p_id}")
            return 0
            
        soup = BeautifulSoup(res.text, 'html.parser')
        q_links = []
        for a in soup.find_all('a', href=re.compile(r'/premium/questao/(\d+)/')):
            num_text = a.get_text(strip=True)
            if num_text.isdigit():
                m = re.search(r'/premium/questao/(\d+)/', a['href'])
                if m:
                    q_links.append((int(num_text), int(m.group(1))))
                    
        q_links = sorted(list(set(q_links)))
        if not q_links:
            print(f"⚠️ Nenhuma questão encontrada na página da prova #{p_id}")
            return 0
            
        print(f"-> {len(q_links)} questões detectadas online na prova #{p_id}. Baixando gabaritos...")
        
        saved_q = {r[0] for r in conn.execute("SELECT numero FROM questoes WHERE prova_id = ? AND (gabarito_oficial != '' OR is_anulada = 1)", (p_id,)).fetchall()}
        
        sucesso = 0
        for num, qid in q_links:
            if num in saved_q:
                sucesso += 1
                continue
                
            q_url = URL_BASE_QUESTAO.format(id=qid)
            q_data, err = extrair_questao(session, q_url, p_id, num)
            
            if not q_data and '500' in str(err):
                time.sleep(2.0)
                session = create_session()
                q_data, err = extrair_questao(session, q_url, p_id, num)
                
            if q_data:
                save_questao(q_data)
                sucesso += 1
            time.sleep(0.15)
            
        update_prova_status(p_id, 'concluida', total_questoes=len(q_links))
        print(f"✅ Prova #{p_id} baixada com sucesso: {sucesso}/{len(q_links)} questões salvas no SQLite.")
        return sucesso
    except Exception as e:
        print(f"❌ Erro na extração online da prova #{p_id}: {e}")
        return 0
    finally:
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python scripts/scrape_single_pdr_exam.py <prova_id>")
        sys.exit(1)
    pid = int(sys.argv[1])
    saved = scrape_exam(pid)
    sys.exit(0 if saved > 0 else 2)
