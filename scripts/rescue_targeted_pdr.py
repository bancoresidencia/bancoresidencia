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
print("🚀 RESGATE CIRÚRGICO DIRECIONADO: PROVAS ONLINE DA PROVADERESIDENCIA.COM.BR", flush=True)
print("=" * 80, flush=True)

# 1. Carregar catálogo de faltantes
with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f).get('catalog', [])

print(f"Total de questões pendentes no catálogo do Gate 6: {len(catalog)}", flush=True)

# 2. Carregar mapeamento
with open('data/supabase_tables/pdr_online_matched_exams.json', 'r', encoding='utf-8') as f:
    matched_data = json.load(f)

# IDs acessíveis confirmados
accessible_eids = {
    1022, 973, 1015, 1063, 2247, 947, 962, 1332, 1034, 1545, 1474, 1460, 
    516, 1136, 1288, 1324, 1304, 1117, 1307, 466, 1120, 1121, 1194, 1290, 
    1146, 1116, 1195, 1309, 1496, 1085, 985, 960, 2202, 1461, 1334, 1540, 
    531, 98, 29, 560, 254, 1538, 1343, 1115, 1320, 1264, 1279, 1517, 1171, 
    959, 946, 991, 1038, 1380, 1366, 1404, 1454, 990
}

# Filtrar apenas os exames acessíveis que correspondem a grupos pendentes
targeted_exams = []
for g in matched_data['matched_groups']:
    for e in g['candidate_online_exams']:
        if e['id'] in accessible_eids:
            targeted_exams.append({
                "id": e['id'],
                "title": e['title'],
                "group": g['group'],
                "banca": g['banca'],
                "year": g['year'],
                "questions": g['questions']
            })

# Deduplicar por id
seen_eids = set()
unique_targeted_exams = []
for te in targeted_exams:
    if te['id'] not in seen_eids:
        seen_eids.add(te['id'])
        unique_targeted_exams.append(te)

print(f"🎯 Total de exames acessíveis cirurgicamente selecionados: {len(unique_targeted_exams)}", flush=True)

def normalize_text(txt):
    if not txt: return ""
    txt = txt.lower()
    txt = re.sub(r'[^\w\s]', ' ', txt)
    return " ".join(txt.split())

os.makedirs('data/imagens_resgatadas_gate6', exist_ok=True)
db_staging = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db_staging.row_factory = sqlite3.Row

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
            "signature": stmt_norm[:100],
            "options": row['options'],
            "images": row['images']
        }

print(f"Registros de faltantes carregados da staging: {len(staging_missing_records)}", flush=True)

def get_session():
    s = requests.Session()
    s.headers.update(config.HEADERS)
    s.cookies.update(config.COOKIES)
    return s

# Passo 1: Extrair todos os links de questões das provas selecionadas
print("\n📡 Extraindo links de questões das provas cirúrgicas...", flush=True)
all_question_tasks = []

for te in unique_targeted_exams:
    s = get_session()
    try:
        r = s.get(f"https://provaderesidencia.com.br/premium/prova/{te['id']}/", timeout=12)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            for a in soup.find_all('a', href=re.compile(r'/premium/questao/(\d+)/')):
                m = re.search(r'/premium/questao/(\d+)/', a['href'])
                if m:
                    all_question_tasks.append({
                        "exam_id": te['id'],
                        "exam_title": te['title'],
                        "qid": m.group(1),
                        "url": f"https://provaderesidencia.com.br/premium/questao/{m.group(1)}/"
                    })
    except Exception as e:
        pass

# Deduplicar questões
seen_qids = set()
unique_question_tasks = []
for qt in all_question_tasks:
    if qt['qid'] not in seen_qids:
        seen_qids.add(qt['qid'])
        unique_question_tasks.append(qt)

print(f"Total de questões individuais para inspecionar: {len(unique_question_tasks)}", flush=True)

# Passo 2: Processar em alta velocidade (20 threads)
print("\n🔍 Inspecionando questões online em paralelo (20 threads)...", flush=True)

lock = threading.Lock()
rescued_items = []
scanned_count = 0
found_imgs_count = 0

def process_single_question(qtask):
    global scanned_count, found_imgs_count
    qid = qtask['qid']
    s = get_session()
    try:
        rq = s.get(qtask['url'], timeout=10)
        with lock:
            scanned_count += 1
            if scanned_count % 100 == 0:
                print(f"  ... inspecionadas {scanned_count}/{len(unique_question_tasks)} questões (Imagens detectadas: {found_imgs_count}, Matches: {len(rescued_items)})...", flush=True)
        
        if rq.status_code != 200: return
        sq = BeautifulSoup(rq.text, 'html.parser')
        
        s3_imgs = []
        for img in sq.find_all('img'):
            src = img.get('src') or ''
            if 's3.amazonaws.com' in src and 'logox' not in src:
                s3_imgs.append(src)
        
        if not s3_imgs: return
        
        with lock:
            found_imgs_count += 1
        
        form = sq.find('form')
        if not form: return
        h3 = form.parent.find('h3')
        if not h3: return
        
        parts = []
        for sib in h3.next_siblings:
            if sib == form: break
            txt = sib.get_text(strip=True) if hasattr(sib, 'get_text') else str(sib).strip()
            if txt: parts.append(txt)
        online_stmt = " ".join(parts)
        online_stmt_norm = normalize_text(online_stmt)
        if len(online_stmt_norm) < 20: return
        
        matched_staging_id = None
        with lock:
            for mid, mdata in staging_missing_records.items():
                if mdata["statement_norm"][:70] in online_stmt_norm or online_stmt_norm[:70] in mdata["statement_norm"]:
                    matched_staging_id = mid
                    break
                if len(mdata["signature"]) > 35 and mdata["signature"][:50] in online_stmt_norm:
                    matched_staging_id = mid
                    break
        
        if matched_staging_id:
            target_rec = staging_missing_records[matched_staging_id]
            print(f"\n🎉 MATCH CONFIRMADO! Staging ID: {target_rec['id']}", flush=True)
            print(f"   Prova: #{qtask['exam_id']} {qtask['exam_title']} | Questão #{qid}", flush=True)
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
                
                with lock:
                    rescued_items.append({
                        "staging_id": matched_staging_id,
                        "online_qid": qid,
                        "exam_id": qtask['exam_id'],
                        "images": saved_webp_paths
                    })
                    if matched_staging_id in staging_missing_records:
                        del staging_missing_records[matched_staging_id]
                print(f"   ✅ SALVO COM SUCESSO! ({len(rescued_items)} resgatadas no total)", flush=True)
                
    except Exception as e:
        pass

with ThreadPoolExecutor(max_workers=20) as executor:
    list(executor.map(process_single_question, unique_question_tasks))

print("\n" + "=" * 80, flush=True)
print(f"🏁 RESGATE CIRÚRGICO DIRECIONADO FINALIZADO:", flush=True)
print(f"Total de questões online inspecionadas: {scanned_count}", flush=True)
print(f"Total de questões online com imagens S3: {found_imgs_count}", flush=True)
print(f"Total de questões resgatadas e gravadas na Staging: {len(rescued_items)}", flush=True)
print("=" * 80, flush=True)

with open('data/supabase_tables/pdr_online_rescue_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "rescued_count": len(rescued_items),
        "rescued_items": rescued_items
    }, f, indent=2, ensure_ascii=False)

