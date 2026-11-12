from PIL import Image
import os

uploaded_paths = [
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519866501_2f4a1222.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519898155_86083b20.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519909201_8d25fc1c.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519931646_cabb037e.jpg'
]

def detect_medq_watermark(img_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    cx, cy = w // 2, h // 2
    
    # Central box (16% of width, 16% of height)
    bw, bh = int(w * 0.16), int(h * 0.16)
    center_crop = img.crop((cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2))
    
    # Outer reference border (to compare baseline)
    border_crop = img.crop((int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9)))
    
    # Calculate saturation / warm tint in center
    cpixels = list(center_crop.getdata())
    diff_rb = [p[0] - p[2] for p in cpixels]
    diff_rg = [p[0] - p[1] for p in cpixels]
    
    avg_diff_rb = sum(diff_rb) / len(diff_rb)
    max_diff_rb = max(diff_rb)
    
    # Check if image is predominantly grayscale
    bpixels = list(border_crop.getdata())[::10]
    is_grayscale_base = sum(abs(p[0] - p[1]) + abs(p[1] - p[2]) for p in bpixels) / len(bpixels) < 8.0
    
    score = 0
    reasons = []
    
    if is_grayscale_base:
        # In grayscale images, center having warm tint is a dead giveaway
        if max_diff_rb > 7.0:
            score += 85
            reasons.append(f"Radiografia PB com anomalia cromática quente no centro (max R-B={max_diff_rb:.1f})")
    else:
        # In color images, center has localized high saturation cross pattern
        if avg_diff_rb > 20.0 and max_diff_rb > 45.0:
            score += 70
            reasons.append(f"Foto clínica com contraste avermelhado/salmão central compatível com carimbo (R-B={avg_diff_rb:.1f})")
            
    return {
        "detected": score >= 50,
        "score": score,
        "is_grayscale": is_grayscale_base,
        "max_diff_rb": max_diff_rb,
        "reasons": reasons
    }

for idx, p in enumerate(uploaded_paths, 1):
    res = detect_medq_watermark(p)
    print(f"Amostra {idx}: Detectado={res['detected']}, Score={res['score']}, PB={res['is_grayscale']}, Razões={res['reasons']}")

