import os
import sys
import json
import sqlite3
from concurrent.futures import ProcessPoolExecutor, as_completed
from PIL import Image, ImageDraw
import time

CATALOG_PATH = r"data/supabase_tables/medq_watermark_catalog.json"
DECISIONS_PATH = r"data/supabase_tables/image_watermark_decisions.json"
DB_PATH = r"data/supabase_tables/supabase_tables.db"

LOCAL_DIRS = [
    r"data/imagens_convertidas_webp",
    r"data/imagens_resgatadas_gate6",
    r"data/imagens_provaderesidencia"
]

OUT_HIGIENIZADAS = r"data/imagens_higienizadas_medq"
OUT_ORIGINAIS = r"data/imagens_medq_originais"
OUT_COMPARACOES = r"data/comparacoes_antes_depois_medq"

os.makedirs(OUT_HIGIENIZADAS, exist_ok=True)
os.makedirs(OUT_ORIGINAIS, exist_ok=True)
os.makedirs(OUT_COMPARACOES, exist_ok=True)

from inpaint_medq_watermark import inpaint_medq_image

def find_local_file(image_url):
    fname = os.path.basename(image_url.split('?')[0])
    for d in LOCAL_DIRS:
        cand = os.path.join(d, fname)
        if os.path.exists(cand):
            return cand
    return None

def make_side_by_side(before_path, after_path, out_path, title_text=""):
    try:
        img_b = Image.open(before_path).convert('RGB')
        img_a = Image.open(after_path).convert('RGB')
        
        target_h = 480
        w_b = int(img_b.width * (target_h / img_b.height))
        w_a = int(img_a.width * (target_h / img_a.height))
        
        img_b_r = img_b.resize((w_b, target_h), Image.Resampling.LANCZOS)
        img_a_r = img_a.resize((w_a, target_h), Image.Resampling.LANCZOS)
        
        header_h = 44
        canvas_w = w_b + w_a + 16
        canvas_h = target_h + header_h
        
        canvas = Image.new('RGB', (canvas_w, canvas_h), (15, 17, 23))
        draw = ImageDraw.Draw(canvas)
        
        # Header banner
        draw.text((16, 12), title_text or "COMPARAÇÃO MEDQ: ANTES vs DEPOIS", fill=(241, 245, 249))
        
        canvas.paste(img_b_r, (8, header_h))
        canvas.paste(img_a_r, (w_b + 12, header_h))
        
        # Label Before
        draw.rectangle([8, header_h, 8 + 140, header_h + 24], fill=(127, 29, 29))
        draw.text((14, header_h + 5), "ANTES (MedQ)", fill=(254, 202, 202))
        
        # Label After
        draw.rectangle([w_b + 12, header_h, w_b + 12 + 150, header_h + 24], fill=(6, 78, 59))
        draw.text((w_b + 18, header_h + 5), "DEPOIS (Limpa)", fill=(167, 243, 208))
        
        canvas.save(out_path, format='WEBP', quality=90, method=4)
        return True
    except Exception as e:
        print(f"Erro ao gerar comparacao {out_path}: {e}")
        return False

def process_single_item(item):
    qid = item['id']
    img_url = item['image_url']
    local_in = find_local_file(img_url)
    
    if not local_in:
        return {"id": qid, "success": False, "error": f"Arquivo local não encontrado para {img_url}"}
    
    base_name = os.path.basename(local_in)
    orig_copy_path = os.path.join(OUT_ORIGINAIS, f"orig_{qid}_{base_name}")
    clean_out_path = os.path.join(OUT_HIGIENIZADAS, f"clean_{qid}_{base_name}")
    comp_out_path = os.path.join(OUT_COMPARACOES, f"comp_{qid}_{base_name}")
    
    # Save copy of original if not exists
    if not os.path.exists(orig_copy_path):
        with open(local_in, 'rb') as f_in, open(orig_copy_path, 'wb') as f_out:
            f_out.write(f_in.read())
            
    # Inpaint
    success = inpaint_medq_image(orig_copy_path, clean_out_path)
    if not success:
        return {"id": qid, "success": False, "error": "Falha no inpainting"}
    
    # Side-by-side comparison
    meta_str = f"Q: {qid} | Banca: {item.get('banca', 'N/A')} ({item.get('year', '')}) | Score: {item.get('score', 0)}%"
    make_side_by_side(orig_copy_path, clean_out_path, comp_out_path, meta_str)
    
    new_storage_url = f"/storage/questoes/imagens_higienizadas_medq/{os.path.basename(clean_out_path)}"
    comp_url = f"/storage/questoes/comparacoes_medq/{os.path.basename(comp_out_path)}"
    
    return {
        "id": qid,
        "success": True,
        "original_url": img_url,
        "new_url": new_storage_url,
        "comparison_url": comp_url
    }

def main():
    start_time = time.time()
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)['catalog']
        
    print(f"Iniciando processamento em lote de {len(catalog)} imagens com marca MedQ...")
    
    # Load decisions
    decisions_data = {"decisions": {}, "visual_answer_corrections": {}, "gate6_actions": {}, "medq_actions": {}}
    if os.path.exists(DECISIONS_PATH):
        try:
            with open(DECISIONS_PATH, 'r', encoding='utf-8') as f:
                decisions_data = json.load(f)
        except Exception:
            pass
    decisions_data.setdefault("medq_actions", {})
    
    # Process with pool
    results = []
    success_count = 0
    fail_count = 0
    
    # Using 4 workers for optimal CPU utilization on Windows
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(process_single_item, item): item for item in catalog}
        for future in as_completed(futures):
            res = future.result()
            results.append(res)
            if res.get('success'):
                success_count += 1
            else:
                fail_count += 1
            total_done = success_count + fail_count
            if total_done % 25 == 0 or total_done == len(catalog):
                elapsed = time.time() - start_time
                print(f"Progresso: {total_done}/{len(catalog)} ({total_done/len(catalog)*100:.1f}%) | Sucessos: {success_count} | Falhas: {fail_count} | Tempo: {elapsed:.1f}s")
                
    # Now update SQLite DB in a single fast transaction
    print("Atualizando banco SQLite de forma atômica...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("BEGIN TRANSACTION")
    
    for r in results:
        if r.get('success'):
            qid = r['id']
            new_url = r['new_url']
            orig_url = r['original_url']
            
            # Fetch current images array
            cursor.execute("SELECT images FROM questions_curated_staging WHERE id = ?", (qid,))
            row = cursor.fetchone()
            if row:
                try:
                    imgs = json.loads(row[0] or '[]')
                    if not isinstance(imgs, list):
                        imgs = [row[0]]
                except Exception:
                    imgs = [orig_url]
                
                # Replace original url with cleaned url
                updated_imgs = [new_url if u == orig_url or os.path.basename(u) == os.path.basename(orig_url) else u for u in imgs]
                cursor.execute("UPDATE questions_curated_staging SET images = ? WHERE id = ?", (json.dumps(updated_imgs), qid))
                
            # Update decision metadata
            decisions_data["medq_actions"][qid] = {
                "action": "inpainted",
                "original_url": orig_url,
                "cleaned_url": new_url,
                "comparison_url": r['comparison_url'],
                "acted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
    conn.commit()
    conn.close()
    
    # Save decisions JSON
    decisions_data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with open(DECISIONS_PATH, 'w', encoding='utf-8') as f:
        json.dump(decisions_data, f, indent=2)
        
    total_time = time.time() - start_time
    print(f"=== LOTE CONCLUÍDO COM SUCESSO! ===")
    print(f"Total processado: {len(catalog)}")
    print(f"Higienizadas com sucesso: {success_count}")
    print(f"Falhas: {fail_count}")
    print(f"Tempo total: {total_time:.1f}s (Média: {total_time/len(catalog):.2f}s/imagem)")

if __name__ == '__main__':
    main()

