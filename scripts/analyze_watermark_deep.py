from PIL import Image, ImageEnhance, ImageOps
import os

img_paths = [
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519866501_2f4a1222.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519898155_86083b20.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519909201_8d25fc1c.jpg',
    r'C:/Users/froge/.gemini/antigravity/brain/4ca079d4-a5c6-44e2-ace8-20af3249b334/.user_uploaded/media_1794519931646_cabb037e.jpg'
]

print("=" * 80)
print("🔬 ANÁLISE ESPECTRAL E CROMÁTICA DA MARCA D'ÁGUA NAS 4 IMAGENS DE EXEMPLO")
print("=" * 80)

for i, p in enumerate(img_paths, 1):
    img = Image.open(p).convert('RGB')
    w, h = img.size
    
    # Recorte central exato da marca d'água (45% a 55% de largura, 40% a 60% de altura)
    cx, cy = w // 2, h // 2
    box_w, box_h = int(w * 0.18), int(h * 0.18)
    crop = img.crop((cx - box_w//2, cy - box_h//2, cx + box_w//2, cy + box_h//2))
    
    # Analisar diferenças de canal R - B e R - G
    pixels = list(crop.getdata())
    diff_rb = [p[0] - p[2] for p in pixels]
    diff_rg = [p[0] - p[1] for p in pixels]
    
    avg_r = sum(p[0] for p in pixels) / len(pixels)
    avg_g = sum(p[1] for p in pixels) / len(pixels)
    avg_b = sum(p[2] for p in pixels) / len(pixels)
    
    max_rb = max(diff_rb)
    avg_rb = sum(diff_rb) / len(diff_rb)
    
    print(f"\nImagem {i} ({w}x{h}):")
    print(f"  Região Central Médias: R={avg_r:.1f}, G={avg_g:.1f}, B={avg_b:.1f}")
    print(f"  Diferencial R - B: Média={avg_rb:.1f}, Máx={max_rb:.1f}")
    
    # Criar imagem diferencial para isolar a marca d'água
    diff_img = Image.new('L', crop.size)
    # Se imagem for em escala de cinza (como rx), R - B ou R - G destaca exatamente o laranja da cruz
    diff_pixels = [min(255, max(0, int((p[0] - p[2]) * 8 + 128))) for p in pixels]
    diff_img.putdata(diff_pixels)
    diff_img.save(f'data/scratch_watermark/watermark_isolated_{i}.png')
    print(f"  -> Salvo recorte diferencial isolado: data/scratch_watermark/watermark_isolated_{i}.png")

