from PIL import Image, ImageFilter, ImageChops

def clean_watermark_adaptive(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    cx, cy = w // 2, h // 2
    
    bw, bh = int(w * 0.24), int(h * 0.24)
    x1, y1 = cx - bw // 2, cy - bh // 2
    x2, y2 = cx + bw // 2, cy + bh // 2
    
    # Crop central area with extra margin for blending
    margin = 15
    bx1 = max(0, x1 - margin)
    by1 = max(0, y1 - margin)
    bx2 = min(w, x2 + margin)
    by2 = min(h, y2 + margin)
    
    crop = img.crop((bx1, by1, bx2, by2))
    
    # Detect if grayscale
    border_crop = img.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)))
    bpixels = list(border_crop.getdata())[::15]
    is_grayscale = sum(abs(p[0] - p[1]) + abs(p[1] - p[2]) for p in bpixels) / len(bpixels) < 10.0
    
    if is_grayscale:
        # Grayscale: luminance recalculation on central area
        lum = crop.convert('L').convert('RGB')
        cleaned_crop = lum
    else:
        # Color image:
        # 1. Frequency separation: low frequency (color and macro contours) + high frequency
        low_freq = crop.filter(ImageFilter.GaussianBlur(radius=3))
        # Median filter removes the sharp lines of the watermark while keeping general gradients
        cleaned_crop = crop.filter(ImageFilter.MedianFilter(size=5))
        # Blend back slightly with low_freq to maintain smooth skin tone transitions
        cleaned_crop = ImageChops.blend(cleaned_crop, low_freq, 0.4)
    
    # Create soft mask for seamless transition
    mask = Image.new('L', (bx2 - bx1, by2 - by1), 0)
    cw, ch = bx2 - bx1, by2 - by1
    
    for y in range(ch):
        for x in range(cw):
            dx = abs(x - cw // 2)
            dy = abs(y - ch // 2)
            rx = dx / (cw / 2)
            ry = dy / (ch / 2)
            dist = max(rx, ry)
            if dist < 0.7:
                val = 255
            elif dist < 1.0:
                val = int(255 * (1.0 - (dist - 0.7) / 0.3))
            else:
                val = 0
            mask.putpixel((x, y), val)
            
    mask = mask.filter(ImageFilter.GaussianBlur(radius=4))
    
    final_img = img.copy()
    final_img.paste(cleaned_crop, (bx1, by1), mask)
    final_img.save(out_path, format='WEBP', quality=92, method=6)
    print(f"Cleaned image saved to {out_path}")

clean_watermark_adaptive('data/test_user_question_24d1.webp', 'data/test_user_question_24d1_adaptive.webp')

