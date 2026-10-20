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

TARGET_PROVA_IDS = [627, 102, 841, 827, 658, 88, 144, 28]

def main():
    print(f"=== DOWNLOAD DAS PROVAS ALVO DA ETAPA 1 ({len(TARGET_PROVA_IDS)} provas) ===")
    init_db()
    session = create_session()
    
    conn = get_connection()
    
    for idx, p_id in enumerate(TARGET_PROVA_IDS):
        print(f"\n[{idx+1}/{len(TARGET_PROVA_IDS)}] Baixando Prova #{p_id}...")
        prova_url = URL_BASE_PROVA.format(id=p_id)
        
        try:
            res = session.get(prova_url, timeout=25)
            if res.status_code != 200:
                print(f"  ❌ Erro ao acessar prova #{p_id}: HTTP {res.status_code}")
                continue
                
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
                print(f"  ⚠️ Nenhuma questão encontrada na prova #{p_id}")
                continue
                
            print(f"  -> {len(q_links)} questões detectadas na prova #{p_id}. Baixando gabaritos...")
            
            # Checar salvas
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
                else:
                    print(f"    ⚠️ Falha questão #{num}: {err}")
                    
                time.sleep(0.2)
                
            print(f"  ✅ Concluída Prova #{p_id}: {sucesso}/{len(q_links)} questões salvas com gabarito oficial.")
            update_prova_status(p_id, 'concluida', total_questoes=len(q_links))
            
        except Exception as e:
            print(f"  ❌ Erro na prova #{p_id}: {e}")
            
    conn.close()
    print("\n🏁 Todas as provas alvo foram processadas!")

if __name__ == '__main__':
    main()
