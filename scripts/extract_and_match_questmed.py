import urllib.request
import json
import http.cookiejar
import sqlite3
import sys
import os
import re
import unicodedata
import time
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

QUESTION_FILES = {
    'cirurgia': 'data/cirurgia_final_questions.json',
    'clinica_medica': 'data/clinica_medica_final_questions.json',
    'ginecologia': 'data/ginecologia_final_questions.json',
    'obstetricia': 'data/obstetricia_final_questions.json',
    'pediatria': 'data/pediatria_final_questions.json',
    'medicina_preventiva': 'data/medicina_preventiva_final_questions.json',
    'urologia': 'data/urologia_final_questions.json'
}

DB_PATH = 'data/questmed_extracted_exams.db'

def norm_hash(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()[:100]

def norm_banca(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').upper()
    return re.sub(r'[^A-Z0-9]', '', text)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS questmed_questions (
            id TEXT PRIMARY KEY,
            banca TEXT,
            ano INTEGER,
            estado TEXT,
            area TEXT,
            sub_area TEXT,
            tipo_prova TEXT,
            numero INTEGER,
            enunciado TEXT,
            enunciado_hash TEXT,
            opcoes_json TEXT,
            gabarito TEXT,
            comentarios_json TEXT,
            tags_json TEXT,
            matched_bank_qid TEXT,
            matched_esp TEXT,
            staged_for_expansion INTEGER DEFAULT 0,
            extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_qm_hash ON questmed_questions(enunciado_hash)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_qm_banca_ano ON questmed_questions(banca, ano, numero)')
    conn.commit()
    return conn

class QuestMedClient:
    def __init__(self, email='antigravity_test_4968@gmail.com', password='Residencia2026!'):
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        self.email = email
        self.password = password
        self.login()

    def login(self):
        payload = json.dumps({'email': self.email, 'password': self.password}).encode('utf-8')
        req = urllib.request.Request('https://api.questmed.com.br/api/auth/sign-in/email', data=payload, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Content-Type': 'application/json',
            'Origin': 'https://www.questmed.com.br',
            'Referer': 'https://www.questmed.com.br/'
        })
        try:
            with self.opener.open(req) as resp:
                if resp.status == 200:
                    print(f"[*] Sessão autenticada no QuestMed com sucesso ({self.email})")
                    return True
        except Exception as e:
            print(f"[!] Erro ao autenticar no QuestMed: {e}")
            return False

    def fetch_questions(self, banca, ano, limit=1000, area=None):
        payload_dict = {'banca': banca, 'ano': ano, 'limit': limit}
        if area:
            payload_dict['area'] = area
        payload = json.dumps(payload_dict).encode('utf-8')

        req = urllib.request.Request('https://api.questmed.com.br/api/simulations/questions', data=payload, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Content-Type': 'application/json',
            'Origin': 'https://www.questmed.com.br',
            'Referer': 'https://www.questmed.com.br/student/simulados',
            'x-client-route': '/student/simulados',
            'x-app-release': 'production'
        })
        try:
            with self.opener.open(req) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                return res.get('data', [])
        except urllib.error.HTTPError as e:
            if e.code == 401:
                print("[!] Sessão expirada. Reautenticando...")
                self.login()
                return self.fetch_questions(banca, ano, limit, area)
            print(f"[!] Erro HTTP {e.code} para {banca} {ano}: {e.read().decode('utf-8', errors='replace')}")
            return []
        except Exception as e:
            print(f"[!] Erro de conexão para {banca} {ano}: {e}")
            return []

def process_year(target_year, conn, qm_exams, all_bank_questions, missing_by_hash, missing_by_banca_num, client, apply_to_bank=False, force_download=False):
    c = conn.cursor()
    year_exams = [ex for ex in qm_exams if ex.get('ano') == target_year]
    bancas = sorted(set(ex.get('banca') for ex in year_exams if ex.get('banca')))

    print("\n" + "=" * 80)
    print(f" INICIANDO ANO {target_year} — {len(year_exams)} cadernos em {len(bancas)} bancas no catálogo")
    print("=" * 80)

    # 1. Download de bancas pendentes no SQLite
    c.execute('SELECT COUNT(*) FROM questmed_questions WHERE ano = ?', (target_year,))
    already_saved_in_year = c.fetchone()[0]

    if already_saved_in_year > 0 and not force_download:
        print(f"[*] Ano {target_year} já possui {already_saved_in_year:,} questões salvas no SQLite.")
    else:
        print(f"[*] Baixando questões de {len(bancas)} bancas para o ano {target_year}...")
        for idx, banca in enumerate(bancas, 1):
            c.execute('SELECT COUNT(*) FROM questmed_questions WHERE banca = ? AND ano = ?', (banca, target_year))
            cnt_b = c.fetchone()[0]
            if cnt_b > 0 and not force_download:
                continue

            qs = client.fetch_questions(banca, target_year, limit=1000)
            if len(qs) >= 1000:
                print(f"  [{idx:2d}/{len(bancas)}] {banca} {target_year}: {len(qs)} questões (particionando por área...)")
                areas = ['Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia e Obstetrícia', 'Medicina Preventiva']
                qs_dict = {q['id']: q for q in qs}
                for a in areas:
                    sub_qs = client.fetch_questions(banca, target_year, limit=1000, area=a)
                    for sq in sub_qs:
                        qs_dict[sq['id']] = sq
                    time.sleep(0.1)
                qs = list(qs_dict.values())
            else:
                if len(qs) > 0:
                    print(f"  [{idx:2d}/{len(bancas)}] {banca} {target_year}: {len(qs)} questões coletadas")

            for q in qs:
                qid = str(q.get('id'))
                stmt = q.get('enunciado') or ''
                h = norm_hash(stmt)
                c.execute('''
                    INSERT INTO questmed_questions (
                        id, banca, ano, estado, area, sub_area, tipo_prova, numero,
                        enunciado, enunciado_hash, opcoes_json, gabarito, comentarios_json, tags_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        gabarito=excluded.gabarito,
                        comentarios_json=excluded.comentarios_json,
                        opcoes_json=excluded.opcoes_json,
                        enunciado=excluded.enunciado
                ''', (
                    qid, q.get('banca'), q.get('ano'), q.get('estado'), q.get('area'),
                    q.get('sub_area'), q.get('tipo_prova'), q.get('numero'),
                    stmt, h,
                    json.dumps(q.get('opcoes') or {}, ensure_ascii=False),
                    (q.get('gabarito') or '').strip().upper(),
                    json.dumps(q.get('comentarios') or {}, ensure_ascii=False),
                    json.dumps(q.get('tags') or [], ensure_ascii=False)
                ))
            conn.commit()
            time.sleep(0.1)

    # 2. Casamento com o banco local
    c.execute('''
        SELECT id, banca, ano, numero, enunciado, enunciado_hash, gabarito, comentarios_json
        FROM questmed_questions
        WHERE ano = ? AND gabarito IS NOT NULL AND gabarito != ''
    ''', (target_year,))
    qm_rows = c.fetchall()

    matches = []
    matched_bank_qids = set()
    matched_qm_ids = set()
    dirty_esp = set()

    for row in qm_rows:
        qm_id, qm_banca, qm_ano, qm_num, qm_stmt, qm_hash, qm_gab, qm_coments_json = row
        
        candidates = missing_by_hash.get(qm_hash, [])
        if not candidates and qm_banca and qm_num:
            b_norm = norm_banca(qm_banca)
            candidates = missing_by_banca_num.get((b_norm, qm_ano, qm_num), [])

        for esp, idx_b, bq in candidates:
            bq_id = bq.get('id')
            if bq_id and bq_id not in matched_bank_qids:
                matched_bank_qids.add(bq_id)
                matched_qm_ids.add(qm_id)

                is_anulada = bool(qm_gab in ['ANULADA', 'X', 'NULA', 'CANCELADA'])
                final_ans = 'ANULADA' if is_anulada else qm_gab

                comentarios_dict = json.loads(qm_coments_json or '{}')
                comment_text = ""
                if isinstance(comentarios_dict, dict) and final_ans in comentarios_dict:
                    comment_text = comentarios_dict[final_ans]

                matches.append({
                    'esp': esp,
                    'bank_qid': bq_id,
                    'qm_id': qm_id,
                    'banca': qm_banca,
                    'ano': qm_ano,
                    'num': qm_num,
                    'gabarito': final_ans,
                    'is_anulada': is_anulada
                })

                if apply_to_bank:
                    bq['correctAnswer'] = final_ans
                    bq['correct_answer'] = final_ans
                    bq['isAnulada'] = is_anulada
                    bq['is_anulada'] = is_anulada
                    bq['source'] = 'questmed'
                    if comment_text:
                        bq['commentary'] = f"Gabarito Oficial [{qm_banca} {qm_ano} Q#{qm_num}]: {comment_text}"
                    else:
                        bq['commentary'] = f"Gabarito Oficial Homologado [{qm_banca} {qm_ano} Q#{qm_num}]."
                    dirty_esp.add(esp)

                c.execute('''
                    UPDATE questmed_questions
                    SET matched_bank_qid = ?, matched_esp = ?, staged_for_expansion = 0
                    WHERE id = ?
                ''', (bq_id, esp, qm_id))

    c.execute('''
        UPDATE questmed_questions
        SET staged_for_expansion = 1
        WHERE ano = ? AND matched_bank_qid IS NULL
    ''', (target_year,))
    conn.commit()

    print(f"\n--- RELATÓRIO ANO {target_year} ---")
    print(f"-> Total no QuestMed:              {len(qm_rows):,} questões")
    print(f"-> Casadas no Banco Oficial:       +{len(matches):,} gabaritos")
    print(f"-> Novas Preservadas em Staging:   {(len(qm_rows) - len(matched_qm_ids)):,} questões")

    cnt_by_esp = Counter(m['esp'] for m in matches)
    for esp, cnt in cnt_by_esp.items():
        print(f"   - {esp:<22}: +{cnt:,} gabaritos")

    cnt_by_banca = Counter(m['banca'] for m in matches)
    print(f"Top Bancas Resolvidas em {target_year}:")
    for b, cnt in cnt_by_banca.most_common(10):
        print(f"   - {b:<25}: +{cnt} questões")

    return matches, dirty_esp

def main():
    apply_to_bank = '--apply' in sys.argv
    force_download = '--force-download' in sys.argv
    all_descending = '--all' in sys.argv

    years_to_process = [2026]
    for arg in sys.argv[1:]:
        if arg.isdigit():
            years_to_process = [int(arg)]
            break

    if all_descending:
        years_to_process = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011]

    print("=" * 80)
    print(f" PIPELINE MASTER QUESTMED -> BANCO RESIDÊNCIA (Modo: {'APLICAR' if apply_to_bank else 'DRY-RUN'})")
    print(f" Anos a processar: {years_to_process}")
    print("=" * 80)

    conn = init_db()

    # 1. Carregar bancas do catálogo
    with open('data/questmed_all_exams_catalog.json', encoding='utf-8') as f:
        qm_exams = json.load(f)

    # 2. Carregar banco local de questões
    print("[*] Carregando questões do banco local...")
    all_bank_questions = {}
    missing_by_hash = {}
    missing_by_banca_num = {}
    total_bank_missing = 0

    for esp, path in QUESTION_FILES.items():
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        all_bank_questions[esp] = data
        for idx_b, q in enumerate(data):
            ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
            is_anul = bool(q.get('isAnulada') or q.get('is_anulada'))
            if not ans and not is_anul:
                total_bank_missing += 1
                stmt = q.get('statement') or q.get('enunciado') or ''
                h = norm_hash(stmt)
                if len(h) >= 25:
                    if h not in missing_by_hash:
                        missing_by_hash[h] = []
                    missing_by_hash[h].append((esp, idx_b, q))

                q_banca = norm_banca(q.get('banca') or q.get('institution') or '')
                q_ano = q.get('year') or q.get('ano')
                q_num = q.get('number') or q.get('numero')
                if q_banca and q_ano and q_num:
                    try:
                        key = (q_banca, int(q_ano), int(q_num))
                        if key not in missing_by_banca_num:
                            missing_by_banca_num[key] = []
                        missing_by_banca_num[key].append((esp, idx_b, q))
                    except:
                        pass

    print(f"Total de questões pendentes no banco geral: {total_bank_missing:,}")

    client = QuestMedClient()
    total_global_matches = 0
    all_dirty_esp = set()

    for yr in years_to_process:
        matches, dirty_esp = process_year(
            yr, conn, qm_exams, all_bank_questions, missing_by_hash, missing_by_banca_num,
            client, apply_to_bank=apply_to_bank, force_download=force_download
        )
        total_global_matches += len(matches)
        all_dirty_esp.update(dirty_esp)

    print("\n" + "=" * 80)
    print(f" TOTAL GLOBAL DE QUESTÕES HOMOLOGADAS: +{total_global_matches:,}")
    print("=" * 80)

    if apply_to_bank and all_dirty_esp:
        print("\n[*] Salvando arquivos JSON das especialidades atualizadas...")
        for esp in all_dirty_esp:
            path = QUESTION_FILES[esp]
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(all_bank_questions[esp], f, ensure_ascii=False, indent=2)
            print(f"  [V] Salvo: {path}")
        print("\n[V] Arquivos locais atualizados com sucesso!")

    conn.close()

if __name__ == '__main__':
    main()
