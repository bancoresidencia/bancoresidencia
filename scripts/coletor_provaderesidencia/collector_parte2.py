import os
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import time
import json
import re
import io
import signal
from urllib.parse import urljoin
from datetime import datetime
import sqlite3
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup, NavigableString
from PIL import Image

try:
    from .config import (
        BASE_DIR, DATA_DIR, COOKIES, HEADERS,
        URL_BASE_PROVA, URL_BASE_QUESTAO
    )
    from .matcher import BankMatcher
except ImportError:
    from config import (
        BASE_DIR, DATA_DIR, COOKIES, HEADERS,
        URL_BASE_PROVA, URL_BASE_QUESTAO
    )
    from matcher import BankMatcher

DB_PARTE2_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta_parte2.db')
STATUS_PARTE2_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia_parte2_status.json')
LOG_PARTE2_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia_parte2.log')
IMAGENS_DIR = os.path.join(DATA_DIR, 'imagens_provaderesidencia')

RUNNING = True

def signal_handler(sig, frame):
    global RUNNING
    print("\n🛑 Sinal de interrupção recebido. Salvando checkpoints e finalizando com segurança...")
    RUNNING = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    formatted = f"[{ts}] {msg}"
    print(formatted)
    try:
        with open(LOG_PARTE2_FILE, 'a', encoding='utf-8') as f:
            f.write(formatted + '\n')
    except:
        pass

def get_connection():
    conn = sqlite3.connect(DB_PARTE2_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_tables():
    conn = get_connection()
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS imagens_arquivo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questao_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            local_path TEXT NOT NULL,
            mime_type TEXT DEFAULT 'image/webp',
            image_blob BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(questao_id, url)
        );
        """)
        # Garantir coluna imagens_locais_json em questoes
        cols = [r['name'] for r in conn.execute("PRAGMA table_info(questoes)").fetchall()]
        if 'imagens_locais_json' not in cols:
            conn.execute("ALTER TABLE questoes ADD COLUMN imagens_locais_json TEXT;")
    conn.close()

def create_session():
    import importlib
    try:
        from . import config
    except ImportError:
        import config
    importlib.reload(config)

    s = requests.Session()
    s.cookies.update(config.COOKIES)
    s.headers.update(config.HEADERS)
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

def processar_e_salvar_imagem_webp(session, img_url, qid, index):
    """
    Baixa a imagem da URL, converte para WebP (qualidade 85),
    salva localmente em data/imagens_provaderesidencia/ e retorna o BLOB WebP.
    """
    try:
        res = session.get(img_url, timeout=15)
        if res.status_code != 200:
            return None

        # Converte para WebP via Pillow
        img = Image.open(io.BytesIO(res.content))
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        buf = io.BytesIO()
        img.save(buf, format='WEBP', quality=85, method=6)
        webp_bytes = buf.getvalue()

        # Salva em arquivo local
        filename = f"q_{qid}_{index}.webp"
        local_rel_path = f"data/imagens_provaderesidencia/{filename}"
        local_abs_path = os.path.join(BASE_DIR, 'data', 'imagens_provaderesidencia', filename)
        os.makedirs(os.path.dirname(local_abs_path), exist_ok=True)

        with open(local_abs_path, 'wb') as f:
            f.write(webp_bytes)

        return {
            'url': img_url,
            'local_path': local_rel_path,
            'mime_type': 'image/webp',
            'blob': webp_bytes
        }
    except Exception as e:
        log(f"   ⚠️ Erro ao converter/baixar imagem ({img_url}): {e}")
        return None

def extrair_filtros_e_metadados(soup):
    filtros = {
        'breadcrumbs': [],
        'badges': [],
        'tags': [],
        'info_fields': {}
    }

    # 1. Breadcrumbs
    bc = soup.find(class_=re.compile(r'breadcrumb'))
    if bc:
        for li in bc.find_all('li'):
            t = li.get_text(strip=True)
            if t and t not in filtros['breadcrumbs']:
                filtros['breadcrumbs'].append(t)

    # 2. Badges / Labels
    for el in soup.find_all(class_=re.compile(r'badge|label|tag')):
        t = el.get_text(strip=True)
        if t and t not in filtros['badges']:
            filtros['badges'].append(t)

    # 3. Metadados de cabeçalho / painel
    info_containers = soup.find_all(class_=re.compile(r'panel-heading|card-header|questao-info|question-header|metadata'))
    for ic in info_containers:
        text = ic.get_text(separator=' | ', strip=True)
        parts = [p.strip() for p in text.split('|') if p.strip()]
        for p in parts:
            if ':' in p:
                k, v = p.split(':', 1)
                filtros['info_fields'][k.strip()] = v.strip()

    especialidade = filtros['info_fields'].get('Especialidade') or filtros['info_fields'].get('Área')
    tema = filtros['info_fields'].get('Tema') or filtros['info_fields'].get('Assunto')
    subtema = filtros['info_fields'].get('Subtema') or filtros['info_fields'].get('Subassunto')

    if not especialidade and len(filtros['breadcrumbs']) > 2:
        for b in filtros['breadcrumbs'][2:]:
            norm_b = b.lower()
            if any(esp in norm_b for esp in ['clinica', 'clínica', 'cirurgia', 'pediatria', 'ginecologia', 'obstetricia', 'obstetrícia', 'preventiva', 'saude coletiva', 'saúde coletiva']):
                especialidade = b
                break

    return filtros, especialidade, tema, subtema

def extrair_questao_parte2(session, q_url, prova_id, q_num):
    res = session.get(q_url, timeout=20)
    if res.status_code != 200:
        return None, f"Status GET {res.status_code}"

    if 'login' in res.url.lower():
        return None, "Sessão expirada: redirecionado para /login"

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

    # 1. Enunciado e Todas as Imagens Detectadas
    statement_parts = []
    imagens_detectadas = []

    if h3:
        curr = h3.next_sibling
        while curr and curr != form:
            if isinstance(curr, NavigableString):
                t = curr.strip()
                if t: statement_parts.append(t)
            elif curr.name == 'img':
                src = curr.get('src')
                if src:
                    full_src = urljoin(q_url, src)
                    if full_src not in imagens_detectadas:
                        imagens_detectadas.append(full_src)
                    statement_parts.append(f"[IMG: {full_src}]")
            elif hasattr(curr, 'find_all'):
                for img in curr.find_all('img'):
                    src = img.get('src')
                    if src:
                        full_src = urljoin(q_url, src)
                        if full_src not in imagens_detectadas:
                            imagens_detectadas.append(full_src)
                t = curr.get_text(strip=True)
                if t: statement_parts.append(t)
            curr = curr.next_sibling

    statement = ' '.join(statement_parts).strip()

    # 2. Alternativas com suporte a imagens
    options = []
    first_choice = None
    for radio_div in form.find_all(class_='radio'):
        inp = radio_div.find('input', {'name': 'choice'})
        val = inp['value'] if inp else None
        if not first_choice and val:
            first_choice = val
        lbl = radio_div.find('label')
        lbl_text = lbl.get_text(strip=True) if lbl else ''

        opt_images = []
        if lbl:
            for img in lbl.find_all('img'):
                src = img.get('src')
                if src:
                    full_src = urljoin(q_url, src)
                    opt_images.append(full_src)
                    if full_src not in imagens_detectadas:
                        imagens_detectadas.append(full_src)

        m = re.match(r'^([A-E])\s*\)\s*(.*)$', lbl_text)
        if m:
            options.append({
                'letter': m.group(1),
                'text': m.group(2),
                'value': val,
                'images': opt_images
            })
        else:
            options.append({
                'letter': '',
                'text': lbl_text,
                'value': val,
                'images': opt_images
            })

    if not first_choice:
        return None, "Nenhuma opção de escolha encontrada"

    # 3. Filtros e Metadados
    filtros, especialidade, tema, subtema = extrair_filtros_e_metadados(soup)

    # 4. Envia POST para revelar gabarito oficial
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

    qid = int(re.search(r'/questao/(\d+)/', q_url).group(1))

    # 5. Baixar e Converter Imagens para WebP + Blob SQLite
    imagens_locais = []
    imagens_arquivadas = []
    for idx_img, img_url in enumerate(imagens_detectadas):
        img_info = processar_e_salvar_imagem_webp(session, img_url, qid, idx_img + 1)
        if img_info:
            imagens_locais.append(img_info['local_path'])
            imagens_arquivadas.append(img_info)

    primary_image = imagens_locais[0] if imagens_locais else (imagens_detectadas[0] if imagens_detectadas else None)

    q_data = {
        'id': qid,
        'prova_id': prova_id,
        'numero': q_num,
        'enunciado': statement,
        'imagem_url': primary_image,
        'imagens_json': json.dumps(imagens_detectadas, ensure_ascii=False),
        'imagens_locais_json': json.dumps(imagens_locais, ensure_ascii=False),
        'opcoes_json': json.dumps(options, ensure_ascii=False),
        'gabarito_oficial': gabarito_oficial,
        'texto_gabarito': correct_text,
        'is_anulada': is_anulada,
        'filtros_json': json.dumps(filtros, ensure_ascii=False),
        'especialidade': especialidade,
        'tema': tema,
        'subtema': subtema,
        '_imagens_arquivadas': imagens_arquivadas
    }
    return q_data, None

def save_questao_parte2(q_data):
    conn = get_connection()
    with conn:
        conn.execute("""
        INSERT INTO questoes (
            id, prova_id, numero, enunciado, imagem_url, imagens_json,
            imagens_locais_json, opcoes_json, gabarito_oficial, texto_gabarito,
            is_anulada, filtros_json, especialidade, tema, subtema
        )
        VALUES (
            :id, :prova_id, :numero, :enunciado, :imagem_url, :imagens_json,
            :imagens_locais_json, :opcoes_json, :gabarito_oficial, :texto_gabarito,
            :is_anulada, :filtros_json, :especialidade, :tema, :subtema
        )
        ON CONFLICT(prova_id, numero) DO UPDATE SET
            enunciado=excluded.enunciado,
            imagem_url=excluded.imagem_url,
            imagens_json=excluded.imagens_json,
            imagens_locais_json=excluded.imagens_locais_json,
            opcoes_json=excluded.opcoes_json,
            gabarito_oficial=excluded.gabarito_oficial,
            texto_gabarito=excluded.texto_gabarito,
            is_anulada=excluded.is_anulada,
            filtros_json=excluded.filtros_json,
            especialidade=excluded.especialidade,
            tema=excluded.tema,
            subtema=excluded.subtema
        """, {k: v for k, v in q_data.items() if not k.startswith('_')})

        # Salva blobs WebP integrados no banco
        for img_info in q_data.get('_imagens_arquivadas', []):
            conn.execute("""
            INSERT INTO imagens_arquivo (questao_id, url, local_path, mime_type, image_blob)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(questao_id, url) DO UPDATE SET
                local_path=excluded.local_path,
                mime_type=excluded.mime_type,
                image_blob=excluded.image_blob
            """, (
                q_data['id'], img_info['url'], img_info['local_path'],
                img_info['mime_type'], img_info['blob']
            ))

    conn.close()

def update_prova_status_parte2(prova_id, status, total_questoes=None, erro_msg=None):
    conn = get_connection()
    with conn:
        if total_questoes is not None:
            conn.execute("""
            UPDATE provas SET status = ?, total_questoes = ?, erro_msg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            """, (status, total_questoes, erro_msg, prova_id))
        else:
            conn.execute("""
            UPDATE provas SET status = ?, erro_msg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            """, (status, erro_msg, prova_id))
    conn.close()

def get_stats_parte2():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT status, count(*) FROM provas GROUP BY status")
    provas_status = dict(c.fetchall())

    c.execute("SELECT count(*) FROM questoes")
    total_q = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE gabarito_oficial != ''")
    com_gab = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE imagens_locais_json != '[]' AND imagens_locais_json IS NOT NULL")
    com_img = c.fetchone()[0]

    c.execute("SELECT count(*) FROM imagens_arquivo")
    total_webp_salvos = c.fetchone()[0]

    conn.close()

    return {
        'total_provas': sum(provas_status.values()),
        'concluidas': provas_status.get('concluida', 0),
        'pendentes': provas_status.get('pendente', 0),
        'em_progresso': provas_status.get('em_progresso', 0),
        'erro': provas_status.get('erro', 0),
        'total_questoes': total_q,
        'questoes_com_gabarito': com_gab,
        'questoes_com_imagens': com_img,
        'total_imagens_webp_arquivo': total_webp_salvos
    }

def salvar_status_live_parte2(stage, details, stats):
    payload = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'database': 'provaderesidencia_coleta_parte2.db',
        'stage': stage,
        'details': details,
        'stats': stats
    }
    try:
        with open(STATUS_PARTE2_FILE, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except:
        pass

LOCK_FILE = os.path.join(DATA_DIR, 'collector_parte2.lock')

def acquire_singleton_lock():
    try:
        import msvcrt
        f = open(LOCK_FILE, 'w')
        msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
        f.write(str(os.getpid()))
        f.flush()
        return f
    except Exception:
        return None

def run_collector_parte2(limit_provas=None):
    global RUNNING
    lock_handle = acquire_singleton_lock()
    if not lock_handle:
        log("⚠️ Já existe outra instância do coletor rodando. Abortando execução duplicada para evitar conflitos.")
        return

    init_tables()
    session = create_session()

    conn = get_connection()
    provas = conn.execute("""
        SELECT * FROM provas
        WHERE status IN ('pendente', 'em_progresso', 'erro')
        ORDER BY ano DESC, id ASC
    """).fetchall()
    conn.close()

    if limit_provas:
        provas = provas[:limit_provas]

    log(f"🚀 [PARTE 2] Fila iniciada: {len(provas)} provas pendentes em {DB_PARTE2_PATH}")
    log(f"🖼️ Imagens: Download ativo com conversão automática para WebP e persistência em disco + BLOB SQLite.")

    provas_processadas = 0

    for idx, prova in enumerate(provas):
        if not RUNNING:
            break

        prova_id = prova['id']
        prova_titulo = prova['titulo']
        inst_label = prova['instituicao_banco'] or prova['instituicao_raw'] or 'Não mapeada'

        update_prova_status_parte2(prova_id, 'em_progresso')
        log(f"\n📂 [{idx+1}/{len(provas)}] Prova #{prova_id}: {prova_titulo} ({inst_label})")

        prova_url = URL_BASE_PROVA.format(id=prova_id)
        try:
            res = session.get(prova_url, timeout=30)
            if 'login' in res.url.lower():
                log("❌ SESSÃO EXPIRADA OU INVÁLIDA! O site redirecionou para /login.")
                update_prova_status_parte2(prova_id, 'pendente')
                break

            if res.status_code != 200:
                update_prova_status_parte2(prova_id, 'erro', erro_msg=f"HTTP {res.status_code}")
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
                update_prova_status_parte2(prova_id, 'concluida', total_questoes=0)
                continue

            total_q = len(q_links)
            conn_q = get_connection()
            existing_saved = conn_q.execute(
                "SELECT numero FROM questoes WHERE prova_id = ? AND (gabarito_oficial != '' OR is_anulada = 1)",
                (prova_id,)
            ).fetchall()
            conn_q.close()
            saved_q_nums = {r[0] for r in existing_saved}

            questoes_ok = len(saved_q_nums)
            for num, qid in q_links:
                if not RUNNING:
                    break
                if num in saved_q_nums:
                    continue

                q_url = URL_BASE_QUESTAO.format(id=qid)
                q_data, err = extrair_questao_parte2(session, q_url, prova_id, num)

                if not q_data and 'login' in str(err).lower():
                    log("❌ Sessão expirada durante a extração de questão.")
                    break

                if not q_data and '500' in str(err):
                    time.sleep(2.5)
                    session = create_session()
                    q_data, err = extrair_questao_parte2(session, q_url, prova_id, num)

                if q_data:
                    save_questao_parte2(q_data)
                    questoes_ok += 1
                else:
                    log(f"   ⚠️ Questão #{num} (ID {qid}): {err}")

                time.sleep(0.3)

            update_prova_status_parte2(prova_id, 'concluida', total_questoes=total_q)
            provas_processadas += 1

            stats = get_stats_parte2()
            salvar_status_live_parte2(
                stage="COLETANDO",
                details=f"Prova #{prova_id}: {prova_titulo} ({idx+1}/{len(provas)})",
                stats=stats
            )
            log(f"   ✅ Prova #{prova_id} concluída ({questoes_ok}/{total_q} questões salvas). [Imagens WebP integradas: {stats['total_imagens_webp_arquivo']}]")

        except Exception as e:
            log(f"❌ Erro na prova #{prova_id}: {e}")
            update_prova_status_parte2(prova_id, 'erro', erro_msg=str(e))

    stats = get_stats_parte2()
    salvar_status_live_parte2(
        stage="CONCLUIDO" if RUNNING else "INTERROMPIDO",
        details="Execução concluída ou interrompida.",
        stats=stats
    )
    log(f"\n🎉 [PARTE 2] Ciclo finalizado! Provas concluídas nesta rodada: {provas_processadas}")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    run_collector_parte2(limit_provas=limit)
