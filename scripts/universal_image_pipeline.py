import os
import sys
import json
import sqlite3
import time
import requests
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

sys.path.append('scripts')
from inpaint_medq_watermark import inpaint_medq_image
from batch_inpaint_all_medq import make_side_by_side

DB_PATH = 'data/supabase_tables/supabase_tables.db'
DECISIONS_PATH = 'data/supabase_tables/image_watermark_decisions.json'
MEDQ_CATALOG_PATH = 'data/supabase_tables/medq_watermark_catalog.json'

DIR_RAW = 'data/imagens_banco_geral'
DIR_CLEAN = 'data/imagens_higienizadas_medq'
DIR_COMP = 'data/comparacoes_antes_depois_medq'
DIR_ORIG = 'data/imagens_medq_originais'

for d in [DIR_RAW, DIR_CLEAN, DIR_COMP, DIR_ORIG]:
    os.makedirs(d, exist_ok=True)

# Multi-spectral detector
def detect_watermark_multispectral(img_path):
    try:
        img = Image.open(img_path).convert('RGB')
        w, h = img.size
        if w < 50 or h < 50:
            return False, 0, "Imagem muito pequena"
            
        cx, cy = w // 2, h // 2
        bw = int(w * 0.20)
        bh = int(h * 0.22)
        
        # 1. Checar fundo branco (Tipo 2: tabelas / laudos / eletroforese)
        boundary_pixels = []
        for x in range(max(0, cx - bw), min(w, cx + bw), 3):
            boundary_pixels.append(img.getpixel((x, max(0, cy - bh))))
            boundary_pixels.append(img.getpixel((x, min(h - 1, cy + bh))))
        avg_r = sum(p[0] for p in boundary_pixels) / len(boundary_pixels)
        avg_g = sum(p[1] for p in boundary_pixels) / len(boundary_pixels)
        avg_b = sum(p[2] for p in boundary_pixels) / len(boundary_pixels)
        
        if avg_r > 225 and avg_g > 225 and avg_b > 225:
            # Em fundo branco, procurar contornos tênues cinza no centro
            center_crop = img.crop((cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2))
            cpixels = list(center_crop.getdata())
            # Pixels de carimbo cinza no centro de documento branco (entre 230 e 252)
            faint_gray = [p for p in cpixels if 228 < p[0] < 253 and abs(p[0]-p[1]) < 12 and abs(p[1]-p[2]) < 12]
            if len(faint_gray) > 120:
                return True, 85, f"Documento em fundo branco com carimbo cinza central ({len(faint_gray)} px)"
                
        # 2. Checar radiografia / tons de cinza com salto salmão
        border_crop = img.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)))
        bpixels = list(border_crop.getdata())[::20]
        is_grayscale = sum(abs(p[0] - p[1]) + abs(p[1] - p[2]) for p in bpixels) / len(bpixels) < 10.0
        
        center_crop = img.crop((cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2))
        cpixels = list(center_crop.getdata())
        diff_rb = [p[0] - p[2] for p in cpixels]
        max_diff_rb = max(diff_rb)
        avg_diff_rb = sum(diff_rb) / len(diff_rb)
        
        if is_grayscale:
            if max_diff_rb > 7.0:
                return True, 85, f"Radiografia PB com anomalia salmão central (max R-B={max_diff_rb:.1f})"
        else:
            # Foto clínica ou ECG com excesso central de salmão comparado à borda
            target_diff_rb = avg_r - avg_b
            if (avg_diff_rb - target_diff_rb) > 6.0 and max_diff_rb > 25.0:
                return True, 80, f"Foto/ECG com salto cromático salmão central (delta={avg_diff_rb - target_diff_rb:.1f})"
                
    except Exception as e:
        return False, 0, str(e)
        
    return False, 0, "Sem marca d'água"

def sanitize_filename(url):
    clean = url.split('?')[0]
    base = os.path.basename(clean)
    if not base.endswith('.webp'):
        base = os.path.splitext(base)[0] + '.webp'
    # Hash prefix to prevent collisions between different subfolders sharing names like 01.webp
    url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()[:8]
    return f"{url_hash}_{base}"

# Global session with connection pool
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=30, pool_maxsize=30, max_retries=2)
session.mount('https://', adapter)
session.mount('http://', adapter)

def process_single_url(url):
    fname = sanitize_filename(url)
    raw_path = os.path.join(DIR_RAW, fname)
    
    # 1. Download if not exists
    if not os.path.exists(raw_path):
        try:
            r = session.get(url, timeout=12, headers={'User-Agent': 'Mozilla/5.0'})
            if r.status_code == 200:
                with open(raw_path, 'wb') as f:
                    f.write(r.content)
            else:
                return {"url": url, "success": False, "error": f"HTTP {r.status_code}"}
        except Exception as e:
            return {"url": url, "success": False, "error": str(e)}
            
    # 2. Detect watermark
    has_wm, score, reason = detect_watermark_multispectral(raw_path)
    
    if has_wm:
        clean_name = f"clean_{fname}"
        clean_path = os.path.join(DIR_CLEAN, clean_name)
        comp_name = f"comp_{fname}"
        comp_path = os.path.join(DIR_COMP, comp_name)
        
        # Inpaint
        try:
            inpaint_medq_image(raw_path, clean_path)
            make_side_by_side(raw_path, clean_path, comp_path, f"Universal Inpaint: {fname[:30]}")
            local_url = f"/storage/questoes/imagens_higienizadas_medq/{clean_name}"
            comp_url = f"/storage/questoes/comparacoes_medq/{comp_name}"
            return {
                "url": url,
                "success": True,
                "watermark": True,
                "score": score,
                "reason": reason,
                "local_url": local_url,
                "comparison_url": comp_url
            }
        except Exception as e:
            # Fallback to raw if inpaint fails
            local_url = f"/storage/questoes/imagens_banco_geral/{fname}"
            return {"url": url, "success": True, "watermark": False, "local_url": local_url}
    else:
        local_url = f"/storage/questoes/imagens_banco_geral/{fname}"
        return {
            "url": url,
            "success": True,
            "watermark": False,
            "local_url": local_url
        }

def main():
    total_start = time.time()
    print("=" * 80)
    print("🚀 INICIANDO PIPELINE UNIVERSAL DE DOWNLOAD, DETECÇÃO E HIGIENIZAÇÃO")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Obter todas as questões com imagens remotas
    stmt_rows = cursor.execute("SELECT id, banca, year, images FROM questions_curated_staging WHERE images LIKE '%http%'").fetchall()
    opt_rows = cursor.execute("SELECT id, banca, year, options FROM questions_curated_staging WHERE options LIKE '%http%'").fetchall()
    
    unique_urls = set()
    for r in stmt_rows:
        try:
            for u in json.loads(r['images'] or '[]'):
                if isinstance(u, str) and u.startswith('http'):
                    unique_urls.add(u)
        except: pass
        
    for r in opt_rows:
        try:
            for o in json.loads(r['options'] or '[]'):
                if isinstance(o.get('text'), str) and o['text'].startswith('http'):
                    unique_urls.add(o['text'])
        except: pass
        
    url_list = list(unique_urls)
    total_urls = len(url_list)
    print(f"Total de URLs únicas a baixar e verificar: {total_urls}")
    
    url_to_result = {}
    completed = 0
    watermark_count = 0
    clean_count = 0
    fail_count = 0
    
    # 2. Executar em paralelo com 20 threads de rede/I/O
    print("Iniciando downloads e análises simultâneas...")
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(process_single_url, u): u for u in url_list}
        for future in as_completed(futures):
            res = future.result()
            url = res['url']
            url_to_result[url] = res
            completed += 1
            
            if res.get('success'):
                if res.get('watermark'):
                    watermark_count += 1
                else:
                    clean_count += 1
            else:
                fail_count += 1
                
            if completed % 100 == 0 or completed == total_urls:
                elapsed = time.time() - total_start
                rate = completed / elapsed if elapsed > 0 else 0
                print(f"Progresso: {completed}/{total_urls} ({completed/total_urls*100:.1f}%) | "
                      f"Marcas detectadas & limpas: {watermark_count} | "
                      f"Limpas: {clean_count} | Falhas: {fail_count} | "
                      f"Velocidade: {rate:.1f} imgs/s")
                      
    # 3. Atualizar o banco SQLite de forma atômica
    print("\n💾 Atualizando tabela questions_curated_staging no banco SQLite...")
    cursor.execute("BEGIN TRANSACTION")
    
    # Atualizar enunciados
    updated_stmt = 0
    for r in stmt_rows:
        qid = r['id']
        try:
            imgs = json.loads(r['images'] or '[]')
            new_imgs = []
            for u in imgs:
                if u in url_to_result and url_to_result[u].get('success'):
                    new_imgs.append(url_to_result[u]['local_url'])
                else:
                    new_imgs.append(u)
            cursor.execute("UPDATE questions_curated_staging SET images = ? WHERE id = ?", (json.dumps(new_imgs), qid))
            updated_stmt += 1
        except Exception as e:
            pass
            
    # Atualizar alternativas
    updated_opt = 0
    for r in opt_rows:
        qid = r['id']
        try:
            opts = json.loads(r['options'] or '[]')
            new_opts = []
            for o in opts:
                txt = o.get('text', '')
                if txt in url_to_result and url_to_result[txt].get('success'):
                    new_opts.append({'letter': o.get('letter'), 'text': url_to_result[txt]['local_url']})
                else:
                    new_opts.append(o)
            cursor.execute("UPDATE questions_curated_staging SET options = ? WHERE id = ?", (json.dumps(new_opts), qid))
            updated_opt += 1
        except Exception as e:
            pass
            
    conn.commit()
    conn.close()
    
    # 4. Atualizar catálogo MedQ e decisões
    print("Atualizando catálogo MedQ e arquivos de decisões...")
    with open(DECISIONS_PATH, 'r', encoding='utf-8') as f:
        decisions_data = json.load(f)
    decisions_data.setdefault('medq_actions', {})
    
    with open(MEDQ_CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    catalog = catalog_data.get('catalog', [])
    catalog_ids = {item['id'] for item in catalog}
    
    # Adicionar novas detecções ao catálogo
    for u, res in url_to_result.items():
        if res.get('success') and res.get('watermark'):
            # Encontrar questões associadas
            cursor_temp = sqlite3.connect(DB_PATH).cursor()
            rows_found = cursor_temp.execute(
                "SELECT id, banca, year, statement FROM questions_curated_staging WHERE images LIKE ? OR options LIKE ? LIMIT 1",
                (f"%{res['local_url']}%", f"%{res['local_url']}%")
            ).fetchall()
            
            for row in rows_found:
                qid = row[0]
                banca = row[1]
                year = row[2]
                stmt = row[3] or ''
                
                decisions_data['medq_actions'][qid] = {
                    'action': 'inpainted',
                    'original_url': u,
                    'cleaned_url': res['local_url'],
                    'comparison_url': res.get('comparison_url'),
                    'acted_at': time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                }
                
                if qid not in catalog_ids:
                    catalog.append({
                        "id": qid,
                        "code": qid,
                        "banca": banca,
                        "year": year,
                        "image_url": res['local_url'],
                        "image_index": 0,
                        "score": res.get('score', 80),
                        "reason": res.get('reason', 'Pipeline universal multi-espectral'),
                        "statement_snippet": stmt[:120]
                    })
                    catalog_ids.add(qid)
                    
    with open(DECISIONS_PATH, 'w', encoding='utf-8') as f:
        json.dump(decisions_data, f, indent=2)
        
    catalog_data['total_detected'] = len(catalog)
    catalog_data['catalog'] = catalog
    with open(MEDQ_CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog_data, f, indent=2)
        
    total_time = time.time() - total_start
    print("=" * 80)
    print("🎉 PIPELINE UNIVERSAL CONCLUÍDO COM SUCESSO!")
    print(f"Total de URLs processadas: {total_urls}")
    print(f"Marcas d'água identificadas e higienizadas: {watermark_count}")
    print(f"Imagens limpas padronizadas em WebP local: {clean_count}")
    print(f"Questões atualizadas no enunciado: {updated_stmt}")
    print(f"Questões atualizadas nas alternativas: {updated_opt}")
    print(f"Novo total de marcas no catálogo: {len(catalog)}")
    print(f"Tempo total: {total_time:.1f}s ({total_time/60:.1f} min)")
    print("=" * 80)

if __name__ == '__main__':
    main()
