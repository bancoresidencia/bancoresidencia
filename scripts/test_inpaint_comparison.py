import os
import sys
from PIL import Image, ImageDraw, ImageFont
from inpaint_medq_watermark import inpaint_medq_image
from test_detector_benchmark import detect_medq_watermark

SAMPLE_DIR = r"C:\Users\froge\.gemini\antigravity\brain\4ca079d4-a5c6-44e2-ace8-20af3249b334\.user_uploaded"
OUT_DIR = r"data/comparacoes_antes_depois_medq"
os.makedirs(OUT_DIR, exist_ok=True)

samples = [
    ("media_1794519866501_2f4a1222.jpg", "Amostra 1 - Abdome Distendido (Foto Clínica)"),
    ("media_1794519898155_86083b20.jpg", "Amostra 2 - Tórax Pediátrico (Radiografia)"),
    ("media_1794519909201_8d25fc1c.jpg", "Amostra 3 - Abdome Agudo Obstrutivo (Radiografia)"),
    ("media_1794519931646_cabb037e.jpg", "Amostra 4 - Coto Umbilical Neonato (Foto Clínica)")
]

def make_side_by_side(before_path, after_path, title, out_path, score_before, score_after):
    img_before = Image.open(before_path).convert('RGB')
    img_after = Image.open(after_path).convert('RGB')
    
    # Resize to standard height for comparison
    target_h = 600
    w_b = int(img_before.width * (target_h / img_before.height))
    w_a = int(img_after.width * (target_h / img_after.height))
    
    img_b_resized = img_before.resize((w_b, target_h), Image.Resampling.LANCZOS)
    img_a_resized = img_after.resize((w_a, target_h), Image.Resampling.LANCZOS)
    
    header_h = 70
    canvas_w = w_b + w_a + 20
    canvas_h = target_h + header_h + 40
    
    canvas = Image.new('RGB', (canvas_w, canvas_h), (18, 21, 30))
    draw = ImageDraw.Draw(canvas)
    
    # Draw Title
    draw.text((20, 15), f"{title}", fill=(255, 255, 255))
    draw.text((20, 38), f"Detector Score Antes: {score_before}%  |  Score Depois: {score_after}%  (Higienização WebP)", fill=(148, 163, 184))
    
    # Paste images
    canvas.paste(img_b_resized, (10, header_h))
    canvas.paste(img_a_resized, (w_b + 20, header_h))
    
    # Draw badges
    draw.rectangle([10, header_h, 10 + 160, header_h + 30], fill=(127, 29, 29))
    draw.text((20, header_h + 6), "ANTES (Com Marca)", fill=(254, 202, 202))
    
    draw.rectangle([w_b + 20, header_h, w_b + 20 + 170, header_h + 30], fill=(6, 78, 59))
    draw.text((w_b + 30, header_h + 6), "DEPOIS (Higienizada)", fill=(167, 243, 208))
    
    canvas.save(out_path, format='WEBP', quality=92)
    print(f"Salvo: {out_path}")

print("=== INICIANDO TESTE DE HIGIENIZAÇÃO NAS 4 AMOSTRAS ===")
for fname, title in samples:
    inp = os.path.join(SAMPLE_DIR, fname)
    clean_out = os.path.join(OUT_DIR, f"cleaned_{fname}.webp")
    comp_out = os.path.join(OUT_DIR, f"comparacao_{fname}.webp")
    
    res_b = detect_medq_watermark(inp)
    inpaint_medq_image(inp, clean_out)
    res_a = detect_medq_watermark(clean_out)
    
    score_b = res_b['score']
    score_a = res_a['score']
    reason_b = "; ".join(res_b['reasons']) if res_b['reasons'] else "Nenhuma"
    reason_a = "; ".join(res_a['reasons']) if res_a['reasons'] else "Livre de marca MedQ"
    
    make_side_by_side(inp, clean_out, title, comp_out, score_b, score_a)
    print(f"[{title}] Score: {score_b}% -> {score_a}% (Razão antes: {reason_b} | Razão depois: {reason_a})")
