import sys
import os
sys.path.append('scripts/coletor_provaderesidencia')
import config
import requests
from bs4 import BeautifulSoup
import re
import json
import sqlite3
import io
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

print("=" * 80, flush=True)
print("🚀 RESGATE ACELERADO DE IMAGENS ONLINE DA PROVADERESIDENCIA.COM.BR", flush=True)
print("=" * 80, flush=True)

# 1. Carregar catálogo de faltantes
with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f).get('catalog', [])

print(f"Total de questões pendentes no catálogo do Gate 6: {len(catalog)}", flush=True)

# Carregar exames mapeados
with open('data/supabase_tables/pdr_online_matched_exams.json', 'r', encoding='utf-8') as f:
    matched_data = json.load(f)

unique_exams_to_process = {}
for g in matched_data['matched_groups']:
    for exam in g['candidate_online_exams']:
        eid = exam['id']
        if eid not in unique_exams_to_process:
            unique_exams_to_process[eid] = {
                "id": eid,
                "title": exam['title'],
                "banca": g['banca'],
                "year": g['year']
            }

print(f"Total de provas online candidatas para verificar: {len(unique_exams_to_process)}", flush=True)

def normalize_text(txt):
    if not txt: return ""
    txt = txt.lower()
    txt = re.sub(r'[^\w\s]', ' ', txt)
    return " ".join(txt.split())

os.makedirs('data/imagens_resgatadas_gate6', exist_ok=True)
db_staging = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db_staging.row_factory = sqlite3.Row

# Pre-carregar todos os enunciados completos das questões faltantes
staging_missing_records = {}
cur = db_staging.cursor()
for q in catalog:
    cur.execute("SELECT id, code, banca, institution, year, statement, options, images FROM questions_curated_staging WHERE id = ?", (q['id'],))
    row = cur.fetchone()
    if row:
        stmt = row['statement'] or ""
        stmt_norm = normalize_text(stmt)
        staging_missing_records[q['id']] = {
            "id": row['id'],
            "code": row['code'],
            "banca": row['banca'],
            "year": row['year'],
            "statement": stmt,
            "statement_norm": stmt_norm,
            "signature": stmt_norm[:120],
            "options": row['options'],
            "images": row['images']
        }

print(f"Registros completos de faltantes carregados da staging: {len(staging_missing_records)}", flush=True)

def get_session():
    s = requests.Session()
    s.headers.update(config.HEADERS)
    s.cookies.update(config.COOKIES)
    return s

# Passo 1: Filtrar quais provas são acessíveis (ThreadPool)
print("\n📡 Testando acessibilidade dos 659 exames online em paralelo (12 threads)...", flush=True)
accessible_exams = []

def check_exam_access(eid_title):
    eid, edata = eid_title
    s = get_session()
    url = f"https://provaderesidencia.com.br/premium/prova/{eid}/"
    try:
        r = s.get(url, timeout=10, allow_redirects=True)
        if 'escolher-plano' not in r.url and r.status_code == 200:
            return edata
    except:
        pass
    return None

with ThreadPoolExecutor(max_workers=12) as executor:
    futures = [executor.submit(check_exam_access, item) for item in unique_exams_to_process.items()]
    done = 0
    for f in as_completed(futures):
        done += 1
        res = f.result()
        if res:
            accessible_exams.append(res)
            print(f"  [+] #{res['id']} {res['title']} -> ACESSÍVEL! ({len(accessible_exams)} encontradas até agora)", flush=True)
        if done % 100 == 0:
            print(f"  ... testados {done}/{len(unique_exams_to_process)} exames...", flush=True)

print(f"\n🎉 Total de provas online 100% acessíveis encontradas: {len(accessible_exams)}", flush=True)

# Passo 2: Para cada prova acessível, extrair links de questões e buscar imagens
print("\n🔍 Processando questões e imagens das provas acessíveis...", flush=True)

rescued_items = []
lock = threading.Lock()

def process_single_exam(exam_data):
    eid = exam_data['id']
    s = get_session()
    exam_url = f"https://provaderesidencia.com.br/premium/prova/{eid}/"
    try:
        r = s.get(exam_url, timeout=12)
        soup = BeautifulSoup(r.text, 'html.parser')
        q_links = soup.find_all('a', href=re.compile(r'/premium/questao/(\d+)/'))
        
        for ql in q_links:
            m_qid = re.search(r'/premium/questao/(\d+)/', ql['href'])
            if not m_qid: continue
            qid = m_qid.group(1)
            q_url = f"https://provaderesidencia.com.br/premium/questao/{qid}/"
            
            try:
                rq = s.get(q_url, timeout=10)
                if rq.status_code != 200: continue
                
                sq = BeautifulSoup(rq.text, 'html.parser')
                s3_imgs = []
                for img in sq.find_all('img'):
                    src = img.get('src') or ''
                    if 's3.amazonaws.com' in src and 'logox' not in src:
                        s3_imgs.append(src)
                
                if not s3_imgs: continue
                
                form = sq.find('form')
                if not form: continue
                h3 = form.parent.find('h3')
                if not h3: continue
                
                parts = []
                for sib in h3.next_siblings:
                    if sib == form: break
                    txt = sib.get_text(strip=True) if hasattr(sib, 'get_text') else str(sib).strip()
                    if txt: parts.append(txt)
                online_stmt = " ".join(parts)
                online_stmt_norm = normalize_text(online_stmt)
                if len(online_stmt_norm) < 20: continue
                
                with lock:
                    matched_staging_id = None
                    for mid, mdata in staging_missing_records.items():
                        if mdata["statement_norm"][:80] in online_stmt_norm or online_stmt_norm[:80] in mdata["statement_norm"]:
                            matched_staging_id = mid
                            break
                        if len(mdata["signature"]) > 40 and mdata["signature"][:60] in online_stmt_norm:
                            matched_staging_id = mid
                            break
                    
                    if matched_staging_id:
                        target_rec = staging_missing_records[matched_staging_id]
                        print(f"\n🎯 MATCH IDENTIFICADO! Staging ID: {target_rec['id']}", flush=True)
                        print(f"   Prova: #{eid} {exam_data['title']} | Questão Online #{qid}", flush=True)
                        print(f"   Imagens S3 ({len(s3_imgs)}): {s3_imgs}", flush=True)
                        
                        saved_webp_paths = []
                        for idx, img_url in enumerate(s3_imgs, 1):
                            res_img = s.get(img_url, timeout=15)
                            if res_img.status_code == 200:
                                img_obj = Image.open(io.BytesIO(res_img.content))
                                if img_obj.mode in ('RGBA', 'LA') or (img_obj.mode == 'P' and 'transparency' in img_obj.info):
                                    pass
                                elif img_obj.mode != 'RGB':
                                    img_obj = img_obj.convert('RGB')
                                
                                filename = f"q_online_{qid}_{idx}.webp"
                                local_path = f"data/imagens_resgatadas_gate6/{filename}"
                                img_obj.save(local_path, format='WEBP', quality=88, method=6)
                                storage_path = f"/storage/questoes/imagens_resgatadas_gate6/{filename}"
                                saved_webp_paths.append(storage_path)
                        
                        if saved_webp_paths:
                            orig_stmt = target_rec['statement']
                            new_stmt = orig_stmt
                            for i in range(1, len(saved_webp_paths) + 1):
                                if f"[IMAGEM {i}]" not in new_stmt:
                                    new_stmt += f"\n\n[IMAGEM {i}]"
                            
                            images_json = json.dumps(saved_webp_paths)
                            
                            conn_th = sqlite3.connect('data/supabase_tables/supabase_tables.db')
                            with conn_th:
                                conn_th.execute("""
                                    UPDATE questions_curated_staging
                                    SET images = ?, statement = ?
                                    WHERE id = ?
                                """, (images_json, new_stmt, matched_staging_id))
                            conn_th.close()
                            
                            rescued_items.append({
                                "staging_id": matched_staging_id,
                                "online_qid": qid,
                                "exam_id": eid,
                                "images": saved_webp_paths
                            })
                            del staging_missing_records[matched_staging_id]
                            print(f"   ✅ SALVO COM SUCESSO! ({len(rescued_items)} resgatadas no total)", flush=True)
            except:
                pass
    except:
        pass

with ThreadPoolExecutor(max_workers=8) as executor:
    list(executor.map(process_single_exam, accessible_exams))

print("\n" + "=" * 80, flush=True)
print(f"🏁 RESGATE ONLINE FAST FINALIZADO:", flush=True)
print(f"Total de questões resgatadas e gravadas: {len(rescued_items)}", flush=True)
print("=" * 80, flush=True)

with open('data/supabase_tables/pdr_online_rescue_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "rescued_count": len(rescued_items),
        "rescued_items": rescued_items
    }, f, indent=2, ensure_ascii=False)

