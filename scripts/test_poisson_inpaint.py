from PIL import Image, ImageFilter
import math

def inpaint_medq_perfect(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    cx, cy = w // 2, h // 2
    
    # Box dimensions for MedQ watermark (roughly 18% of width, 20% of height)
    bw = int(w * 0.20)
    bh = int(h * 0.22)
    
    # Check if image is grayscale (radiology) or color (photo)
    border_crop = img.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)))
    bpixels = list(border_crop.getdata())[::15]
    is_grayscale = sum(abs(p[0] - p[1]) + abs(p[1] - p[2]) for p in bpixels) / len(bpixels) < 10.0
    
    if is_grayscale:
        # For X-rays/radiology: Pure luminance restoration on the center
        pixels = list(img.getdata())
        new_pixels = []
        for y in range(h):
            for x in range(w):
                idx = y * w + x
                r, g, b = pixels[idx]
                dx = abs(x - cx)
                dy = abs(y - cy)
                if dx < bw and dy < bh:
                    weight = min(1.0, max(0.0, 1.0 - (dx/bw)**2 - (dy/bh)**2))
                    if weight > 0:
                        lum = int(0.299 * r + 0.587 * g + 0.114 * b)
                        nr = int(r * (1 - weight) + lum * weight)
                        ng = int(g * (1 - weight) + lum * weight)
                        nb = int(b * (1 - weight) + lum * weight)
                        new_pixels.append((nr, ng, nb))
                    else:
                        new_pixels.append((r, g, b))
                else:
                    new_pixels.append((r, g, b))
        res_img = Image.new('RGB', (w, h))
        res_img.putdata(new_pixels)
    else:
        # For color photos: Use surrounding border interpolation + median texture blending
        # Boundary sampling
        x1, y1 = max(0, cx - bw), max(0, cy - bh)
        x2, y2 = min(w, cx + bw), min(h, cy + bh)
        
        # Sample boundary pixels around the box
        boundary_r, boundary_g, boundary_b = [], [], []
        for x in range(x1, x2):
            p_top = img.getpixel((x, y1))
            p_bot = img.getpixel((x, y2 - 1))
            boundary_r.extend([p_top[0], p_bot[0]])
            boundary_g.extend([p_top[1], p_bot[1]])
            boundary_b.extend([p_top[2], p_bot[2]])
            
        for y in range(y1, y2):
            p_left = img.getpixel((x1, y))
            p_right = img.getpixel((x2 - 1, y))
            boundary_r.extend([p_left[0], p_right[0]])
            boundary_g.extend([p_left[1], p_right[1]])
            boundary_b.extend([p_left[2], p_right[2]])
            
        avg_r = sum(boundary_r) / len(boundary_r)
        avg_g = sum(boundary_g) / len(boundary_g)
        avg_b = sum(boundary_b) / len(boundary_b)
        
        # Create a blurred/median version of the patch to remove fine watermark lines
        patch = img.crop((x1, y1, x2, y2))
        patch_median = patch.filter(ImageFilter.MedianFilter(size=7))
        patch_blurred = patch_median.filter(ImageFilter.GaussianBlur(radius=3))
        
        # Chromatic normalization: remove excess red/salmon relative to surrounding boundary
        target_diff_rb = avg_r - avg_b
        target_diff_rg = avg_r - avg_g
        
        patch_pixels = list(patch_blurred.getdata())
        pw, ph = patch.size
        pcx, pcy = pw // 2, ph // 2
        
        new_patch_pixels = []
        for py in range(ph):
            for px in range(pw):
                idx = py * pw + px
                r, g, b = patch_pixels[idx]
                
                # Distance from center of patch normalized (0 at center, 1 at boundary)
                dx = abs(px - pcx) / pcx
                dy = abs(py - pcy) / pcy
                dist = math.sqrt(dx*dx + dy*dy)
                
                # Feather weight: 1.0 inside central 60%, decays to 0 at edges
                if dist < 0.6:
                    weight = 1.0
                elif dist < 1.0:
                    weight = 0.5 * (1.0 + math.cos(math.pi * (dist - 0.6) / 0.4))
                else:
                    weight = 0.0
                    
                if weight > 0:
                    # Target chrominance based on boundary baseline
                    cur_diff_rb = r - b
                    cur_diff_rg = r - g
                    
                    excess_rb = cur_diff_rb - target_diff_rb
                    excess_rg = cur_diff_rg - target_diff_rg
                    
                    # Adjust R, G, B toward boundary chrominance
                    adj_r = int(r - (excess_rb * 0.5 * weight))
                    adj_b = int(b + (excess_rb * 0.5 * weight))
                    adj_g = int(g + (excess_rg * 0.2 * weight))
                    
                    # Clamp 0-255
                    adj_r = max(0, min(255, adj_r))
                    adj_g = max(0, min(255, adj_g))
                    adj_b = max(0, min(255, adj_b))
                    new_patch_pixels.append((adj_r, adj_g, adj_b))
                else:
                    new_patch_pixels.append((r, g, b))
                    
        cleaned_patch = Image.new('RGB', (pw, ph))
        cleaned_patch.putdata(new_patch_pixels)
        
        # Mask for seamless blending
        mask = Image.new('L', (pw, ph), 0)
        for py in range(ph):
            for px in range(pw):
                dx = abs(px - pcx) / pcx
                dy = abs(py - pcy) / pcy
                dist = math.sqrt(dx*dx + dy*dy)
                if dist < 0.6:
                    val = 255
                elif dist < 1.0:
                    val = int(255 * 0.5 * (1.0 + math.cos(math.pi * (dist - 0.6) / 0.4)))
                else:
                    val = 0
                mask.putpixel((px, py), val)
                
        mask = mask.filter(ImageFilter.GaussianBlur(radius=5))
        
        res_img = img.copy()
        res_img.paste(cleaned_patch, (x1, y1), mask)
        
    res_img.save(out_path, format='WEBP', quality=92, method=6)
    print("Salvo com sucesso:", out_path)
    return True

inpaint_medq_perfect('data/test_user_question_24d1.webp', 'data/test_user_question_24d1_perfect.webp')

