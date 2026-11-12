import sqlite3
import json
import os
import requests
import io
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

print("=" * 80)
print("🔍 VARREDURA DE MARCA D'ÁGUA CENTRAL MEDQ (CÉREBRO + CRUZ)")
print("=" * 80)

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

rows = db.execute("""
    SELECT id, code, banca, institution, year, statement, options, images 
    FROM questions_curated_staging 
    WHERE images IS NOT NULL AND images != '[]' AND images != ''
    ORDER BY year DESC, id ASC
""").fetchall()

print(f"Total de questões com imagem para analisar: {len(rows)}")

os.makedirs('data/imagens_higienizadas_medq', exist_ok=True)
CACHE_DIR = 'data/cache_images_audit'
os.makedirs(CACHE_DIR, exist_ok=True)

def detect_medq_in_image(img_obj):
    try:
        w, h = img_obj.size
        if w < 50 or h < 50: return False, 0, "Imagem muito pequena"
        cx, cy = w // 2, h // 2
        
        bw, bh = int(w * 0.18), int(h * 0.18)
        center_crop = img_obj.crop((cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2))
        
        cpixels = list(center_crop.convert('RGB').getdata())
        diff_rb = [p[0] - p[2] for p in cpixels]
        max_diff_rb = max(diff_rb)
        avg_diff_rb = sum(diff_rb) / len(diff_rb)
        
        # Amostragem de borda
        border_crop = img_obj.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)))
        bpixels = list(border_crop.convert('RGB').getdata())[::15]
        is_grayscale_base = sum(abs(p[0] - p[1]) + abs(p[1] - p[2]) for p in bpixels) / len(bpixels) < 8.0
        
        if is_grayscale_base and max_diff_rb > 7.0:
            return True, 85, f"Radiografia PB com anomalia cromática salmão/laranja no centro (max={max_diff_rb:.1f})"
            
        if not is_grayscale_base and avg_diff_rb > 22.0 and max_diff_rb > 45.0:
            return True, 70, f"Foto clínica com marca d'água avermelhada/salmão central (avg={avg_diff_rb:.1f})"
            
    except Exception as e:
        return False, 0, str(e)
        
    return False, 0, "Sem marca d'água central detectada"

detected_catalog = []

# Analisar primeiras 500 questões ou locais para inicializar catálogo
for idx, r in enumerate(rows):
    try:
        imgs = json.loads(r['images'])
        if not isinstance(imgs, list) or len(imgs) == 0: continue
        
        for img_idx, img_url in enumerate(imgs):
            local_file = None
            if img_url.startswith('/storage/questoes/'):
                rel = img_url.replace('/storage/questoes/', '')
                cand1 = os.path.join('data/imagens_provaderesidencia', rel)
                cand2 = os.path.join('data/imagens_convertidas_webp', rel)
                cand3 = os.path.join('data/imagens_resgatadas_gate6', rel)
                if os.path.exists(cand1): local_file = cand1
                elif os.path.exists(cand2): local_file = cand2
                elif os.path.exists(cand3): local_file = cand3
                
            if local_file and os.path.exists(local_file):
                img = Image.open(local_file)
                detected, score, reason = detect_medq_in_image(img)
                if detected:
                    detected_catalog.append({
                        "id": r['id'],
                        "code": r['code'],
                        "banca": r['banca'],
                        "year": r['year'],
                        "image_url": img_url,
                        "image_index": img_idx,
                        "local_file": local_file,
                        "score": score,
                        "reason": reason,
                        "statement_snippet": (r['statement'] or '')[:120]
                    })
    except:
        pass

print(f"\n✅ Total de imagens com marca d'água MedQ identificadas inicialmente: {len(detected_catalog)}")

# Salvar catálogo inicial
catalog_path = 'data/supabase_tables/medq_watermark_catalog.json'
with open(catalog_path, 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "total_detected": len(detected_catalog),
        "catalog": detected_catalog
    }, f, indent=2, ensure_ascii=False)

print(f"Catálogo salvo em {catalog_path}")

