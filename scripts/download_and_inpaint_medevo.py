import os
import sys
import json
import sqlite3
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

sys.path.append('scripts')
from inpaint_medq_watermark import inpaint_medq_image
from batch_inpaint_all_medq import make_side_by_side
from test_detector_benchmark import detect_medq_watermark

DB_PATH = 'data/supabase_tables/supabase_tables.db'
DECISIONS_PATH = 'data/supabase_tables/image_watermark_decisions.json'
MEDQ_CATALOG_PATH = 'data/supabase_tables/medq_watermark_catalog.json'

DOWNLOAD_DIR = 'data/imagens_medevo_download'
HIGIENIZADAS_DIR = 'data/imagens_higienizadas_medq'
ORIGINAIS_DIR = 'data/imagens_medq_originais'
COMPARACOES_DIR = 'data/comparacoes_antes_depois_medq'

for d in [DOWNLOAD_DIR, HIGIENIZADAS_DIR, ORIGINAIS_DIR, COMPARACOES_DIR]:
    os.makedirs(d, exist_ok=True)

def process_medevo_question(q):
    qid = q['id']
    banca = q['banca']
    year = q['year']
    
    try:
        imgs = json.loads(q['images'] or '[]')
    except Exception:
        return {"id": qid, "success": False, "error": "Invalid images JSON"}
        
    if not imgs or not imgs[0].startswith('http'):
        return {"id": qid, "success": False, "skipped": True}
        
    url = imgs[0]
    base_name = os.path.basename(url.split('?')[0])
    download_path = os.path.join(DOWNLOAD_DIR, f"{qid}_{base_name}")
    
    # 1. Download
    if not os.path.exists(download_path):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                with open(download_path, 'wb') as f:
                    f.write(r.content)
            else:
                return {"id": qid, "success": False, "error": f"HTTP {r.status_code}"}
        except Exception as e:
            return {"id": qid, "success": False, "error": str(e)}
            
    # 2. Check detector
    det = detect_medq_watermark(download_path)
    # If detected or if from medevo revalida/residencia 2026, process it!
    is_target = det['detected'] or '2026' in url or 'revalida' in url
    
    if not is_target:
        return {"id": qid, "success": True, "watermark": False, "download_path": download_path}
        
    orig_copy_path = os.path.join(ORIGINAIS_DIR, f"orig_{qid}_{base_name}")
    clean_out_path = os.path.join(HIGIENIZADAS_DIR, f"clean_{qid}_{base_name}")
    comp_out_path = os.path.join(COMPARACOES_DIR, f"comp_{qid}_{base_name}")
    
    if not os.path.exists(orig_copy_path):
        with open(download_path, 'rb') as f_in, open(orig_copy_path, 'wb') as f_out:
            f_out.write(f_in.read())
            
    # 3. Inpaint
    success = inpaint_medq_image(orig_copy_path, clean_out_path)
    if not success:
        return {"id": qid, "success": False, "error": "Inpaint failed"}
        
    # 4. Side-by-side comparison
    make_side_by_side(orig_copy_path, clean_out_path, comp_out_path, f"{banca} ({year}) | {qid}")
    
    new_storage_url = f"/storage/questoes/imagens_higienizadas_medq/{os.path.basename(clean_out_path)}"
    comp_url = f"/storage/questoes/comparacoes_medq/{os.path.basename(comp_out_path)}"
    
    return {
        "id": qid,
        "success": True,
        "watermark": True,
        "banca": banca,
        "year": year,
        "score": det.get('score', 80),
        "reason": "; ".join(det.get('reasons', [])) or "Medevo 2026/Revalida carimbo MedQ",
        "original_url": url,
        "new_url": new_storage_url,
        "comparison_url": comp_url
    }

def main():
    start = time.time()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    rows = cursor.execute("""
        SELECT id, banca, year, images 
        FROM questions_curated_staging 
        WHERE images LIKE '%api.medevo.com.br%'
    """).fetchall()
    
    print(f"Encontradas {len(rows)} questões da Medevo para baixar e higienizar...")
    
    # Process in parallel with 12 threads (mostly I/O download)
    processed = []
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(process_medevo_question, dict(r)): r['id'] for r in rows}
        for future in as_completed(futures):
            res = future.result()
            processed.append(res)
            if len(processed) % 30 == 0 or len(processed) == len(rows):
                print(f"Progresso Medevo: {len(processed)}/{len(rows)} ({len(processed)/len(rows)*100:.1f}%)")
                
    # Update SQLite in one transaction
    print("Atualizando banco SQLite...")
    cursor.execute("BEGIN TRANSACTION")
    
    with open(DECISIONS_PATH, 'r', encoding='utf-8') as f:
        decisions_data = json.load(f)
    decisions_data.setdefault('medq_actions', {})
    
    with open(MEDQ_CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    catalog = catalog_data.get('catalog', [])
    catalog_ids = {item['id'] for item in catalog}
    
    updated_count = 0
    for p in processed:
        if p.get('success') and p.get('watermark'):
            qid = p['id']
            new_url = p['new_url']
            cursor.execute("UPDATE questions_curated_staging SET images = ? WHERE id = ?", (json.dumps([new_url]), qid))
            
            decisions_data['medq_actions'][qid] = {
                'action': 'inpainted',
                'original_url': p['original_url'],
                'cleaned_url': new_url,
                'comparison_url': p['comparison_url'],
                'acted_at': time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            if qid not in catalog_ids:
                catalog.append({
                    "id": qid,
                    "code": qid,
                    "banca": p['banca'],
                    "year": p['year'],
                    "image_url": p['original_url'],
                    "image_index": 0,
                    "score": p['score'],
                    "reason": p['reason'],
                    "statement_snippet": ""
                })
                catalog_ids.add(qid)
                
            updated_count += 1
            
    conn.commit()
    conn.close()
    
    # Save decisions & catalog
    with open(DECISIONS_PATH, 'w', encoding='utf-8') as f:
        json.dump(decisions_data, f, indent=2)
        
    catalog_data['total_detected'] = len(catalog)
    catalog_data['catalog'] = catalog
    with open(MEDQ_CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog_data, f, indent=2)
        
    print(f"\n✅ Concluído! {updated_count} questões Medevo foram higienizadas e atualizadas no banco.")
    print(f"Novo total no catálogo MedQ: {len(catalog)}")
    print(f"Tempo total: {time.time() - start:.1f}s")

if __name__ == '__main__':
    main()

