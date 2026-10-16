import os
import sys

# Garante suporte a UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import time
import json
import re
import signal
import concurrent.futures
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup, NavigableString

from .config import (
    BASE_DIR, DATA_DIR, COOKIES, HEADERS,
    URL_BANCO_PROVAS, URL_BASE_PROVA, URL_BASE_QUESTAO,
    STATUS_FILE, LOG_FILE
)
from .db import (
    init_db, save_provas, get_provas_pendentes, update_prova_status,
    save_questao, get_stats, get_connection
)
from .matcher import BankMatcher

RUNNING = True

def signal_handler(sig, frame):
    global RUNNING
    print("\n🛑 Sinal de interrupção recebido. Finalizando com segurança e salvando checkpoints...")
    RUNNING = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    formatted = f"[{ts}] {msg}"
    print(formatted)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(formatted + '\n')
    except:
        pass

def create_session():
    s = requests.Session()
    s.cookies.update(COOKIES)
    s.headers.update(HEADERS)
    retries = Retry(
        total=2,
        backoff_factor=0.3,
        status_forcelist=[429, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=10)
    s.mount('https://', adapter)
    s.mount('http://', adapter)
    return s

def catalogar_provas(session, matcher):
    log("Iniciando catalogação das provas acessíveis no site...")
    res = session.get(URL_BANCO_PROVAS, timeout=30)
    if res.status_code != 200:
        log(f"❌ Erro ao acessar {URL_BANCO_PROVAS}: Status {res.status_code}")
        return 0

    soup = BeautifulSoup(res.text, 'html.parser')
    links = soup.find_all('a', href=re.compile(r'/premium/prova/\d+/'))
    provas_list = []

    for a in links:
        badge_el = a.find(class_=re.compile(r'label|badge'))
        badge = badge_el.get_text(strip=True) if badge_el else ''
        
        # Apenas provas acessíveis (Gratuito ou Premium Gratuito)
        if badge in ['Gratuito', 'Premium (Gratuito)']:
            m_id = re.search(r'/prova/(\d+)/', a['href'])
            if not m_id:
                continue
            prova_id = int(m_id.group(1))
            raw_title = a.get_text(strip=True)
            clean_title = raw_title.replace(badge, '').strip()

            parts = [p.strip() for p in clean_title.split('-')]
            inst_raw = parts[0] if parts else ''
            uf = ''
            ano = None
            for p in parts[1:]:
                if len(p) == 2 and p.isalpha() and p.isupper():
                    uf = p
                elif p.isdigit() and len(p) == 4:
                    ano = int(p)
            
            modalidade = ' - '.join(parts[2:]) if len(parts) > 2 else ''
            inst_banco = matcher.match_institution(inst_raw)

            provas_list.append({
                'id': prova_id,
                'titulo': clean_title,
                'badge': badge,
                'instituicao_raw': inst_raw,
                'uf': uf,
                'ano': ano,
                'modalidade': modalidade,
                'instituicao_banco': inst_banco
            })

    save_provas(provas_list)
    log(f"✅ Catalogadas com sucesso: {len(provas_list)} provas liberadas.")
    return len(provas_list)

def extrair_questao(session, q_url, prova_id, q_num):
    res = session.get(q_url, timeout=20)
    if res.status_code != 200:
        return None, f"Status GET {res.status_code}"

    soup = BeautifulSoup(res.text, 'html.parser')
    form = soup.find('form')
    if not form:
        return None, "Formulário de resposta não encontrado"

    csrf_input = form.find('input', {'name': 'csrfmiddlewaretoken'})
    if not csrf_input:
        return None, "Token CSRF ausente"
    csrf = csrf_input['value']

    parent = form.parent
    h3 = parent.find('h3')

    # Enunciado e imagens
    statement_parts = []
    imagem_url = None
    if h3:
        curr = h3.next_sibling
        while curr and curr != form:
            if isinstance(curr, NavigableString):
                t = curr.strip()
                if t: statement_parts.append(t)
            elif curr.name == 'img':
                src = curr.get('src')
                if src:
                    imagem_url = src
                    statement_parts.append(f"[IMG: {src}]")
            elif hasattr(curr, 'get_text'):
                t = curr.get_text(strip=True)
                if t: statement_parts.append(t)
            curr = curr.next_sibling

    statement = ' '.join(statement_parts).strip()

    # Alternativas
    options = []
    first_choice = None
    for radio_div in form.find_all(class_='radio'):
        inp = radio_div.find('input', {'name': 'choice'})
        val = inp['value'] if inp else None
        if not first_choice and val:
            first_choice = val
        lbl = radio_div.find('label')
        lbl_text = lbl.get_text(strip=True) if lbl else ''
        m = re.match(r'^([A-E])\s*\)\s*(.*)$', lbl_text)
        if m:
            options.append({'letter': m.group(1), 'text': m.group(2), 'value': val})
        else:
            options.append({'letter': '', 'text': lbl_text, 'value': val})

    if not first_choice:
        return None, "Nenhuma opção de escolha encontrada"

    # Envia POST com o primeiro choice para o servidor retornar o gabarito oficial
    post_res = session.post(
        q_url,
        data={'csrfmiddlewaretoken': csrf, 'choice': first_choice},
        headers={'Referer': q_url},
        timeout=20
    )

    if post_res.status_code != 200:
        return None, f"Status POST {post_res.status_code}"

    post_soup = BeautifulSoup(post_res.text, 'html.parser')
    correct_div = post_soup.find(class_='alert-success')
    correct_label = correct_div.find('label') if correct_div else None
    correct_text = correct_label.get_text(strip=True) if correct_label else ''

    m_ans = re.match(r'^([A-E])\s*\)', correct_text)
    gabarito_oficial = m_ans.group(1) if m_ans else ''
    is_anulada = 1 if ('anulada' in post_res.text.lower() and not gabarito_oficial) else 0

    q_data = {
        'id': int(re.search(r'/questao/(\d+)/', q_url).group(1)),
        'prova_id': prova_id,
        'numero': q_num,
        'enunciado': statement,
        'imagem_url': imagem_url,
        'opcoes_json': json.dumps(options, ensure_ascii=False),
        'gabarito_oficial': gabarito_oficial,
        'texto_gabarito': correct_text,
        'is_anulada': is_anulada
    }
    return q_data, None

def salvar_status_live(stage, details, stats):
    status_payload = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'stage': stage,
        'details': details,
        'stats': stats
    }
    try:
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(status_payload, f, ensure_ascii=False, indent=2)
    except:
        pass

def run_collector(limit_provas=None, delay=0.2):
    global RUNNING
    init_db()
    matcher = BankMatcher()
    session = create_session()

    # 1. Catalogar se ainda não catalogado
    conn = get_connection()
    count_provas = conn.execute("SELECT count(*) FROM provas").fetchone()[0]
    conn.close()

    if count_provas == 0:
        catalogar_provas(session, matcher)

    # 2. Obter fila de provas pendentes
    provas = get_provas_pendentes()
    if limit_provas:
        provas = provas[:limit_provas]

    log(f"🚀 Fila de trabalho iniciada: {len(provas)} provas pendentes para processamento.")

    provas_processadas = 0

    for idx, prova in enumerate(provas):
        if not RUNNING:
            break

        prova_id = prova['id']
        prova_titulo = prova['titulo']
        inst_label = prova['instituicao_banco'] or prova['instituicao_raw'] or 'Não mapeada'
        
        update_prova_status(prova_id, 'em_progresso')
        log(f"\n📂 [{idx+1}/{len(provas)}] Prova #{prova_id}: {prova_titulo} (Instituição: {inst_label})")

        prova_url = URL_BASE_PROVA.format(id=prova_id)
        try:
            res = session.get(prova_url, timeout=30)
            if res.status_code != 200:
                update_prova_status(prova_id, 'erro', erro_msg=f"HTTP {res.status_code}")
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
                log(f"⚠️ Nenhuma questão encontrada na prova #{prova_id}")
                update_prova_status(prova_id, 'concluida', total_questoes=0)
                continue

            total_q = len(q_links)
            log(f"   -> {total_q} questões detectadas. Coletando sequencialmente com intervalo de segurança...")

            questoes_ok = 0
            for num, qid in q_links:
                if not RUNNING:
                    break

                q_url = URL_BASE_QUESTAO.format(id=qid)
                q_data, err = extrair_questao(session, q_url, prova_id, num)

                # Se falhar com erro temporário 500, renova a sessão e espera 3s
                if not q_data and '500' in str(err):
                    time.sleep(3.0)
                    try: session.close()
                    except: pass
                    session = create_session()
                    q_data, err = extrair_questao(session, q_url, prova_id, num)

                if q_data:
                    save_questao(q_data)
                    matcher.process_collected_question(q_data, prova)
                    questoes_ok += 1
                else:
                    log(f"   ⚠️ Questão #{num} (ID {qid}): {err}")

                time.sleep(0.3)

            update_prova_status(prova_id, 'concluida', total_questoes=total_q)
            provas_processadas += 1

            # Renova sessão entre cada prova para manter conexão e cookies sempre limpos
            try: session.close()
            except: pass
            session = create_session()

            # Grava periodicamente as alterações nos arquivos do banco
            matcher.flush_updates()

            # Atualiza status live
            stats = get_stats()
            salvar_status_live(
                stage="COLETANDO",
                details=f"Processando prova #{prova_id}: {prova_titulo} ({idx+1}/{len(provas)})",
                stats=stats
            )

            log(f"   ✅ Prova #{prova_id} concluída ({questoes_ok}/{total_q} gabaritos coletados). Total Matches no Banco: {stats['total_matches_banco']:,}")

        except Exception as e:
            log(f"❌ Erro na prova #{prova_id}: {e}")
            update_prova_status(prova_id, 'erro', erro_msg=str(e))

    # Gravação final
    matcher.flush_updates()
    stats = get_stats()
    salvar_status_live(
        stage="CONCLUIDO" if RUNNING else "INTERROMPIDO",
        details="Coleta finalizada ou pausada pelo usuário.",
        stats=stats
    )
    log(f"\n🎉 Ciclo de coleta finalizado! Provas concluídas: {provas_processadas} | Matches no Banco: {stats['total_matches_banco']:,}")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    run_collector(limit_provas=limit)
