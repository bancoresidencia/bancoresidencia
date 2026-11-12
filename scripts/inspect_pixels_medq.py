from PIL import Image

img = Image.open('data/test_user_question_24d1.webp').convert('RGB')
w, h = img.size
cx, cy = w // 2, h // 2

# Surrounding background reference (around the center box)
# Box is around (cx-50, cy-50) to (cx+50, cy+50)
surround_pixels = []
for y in range(cy - 70, cy + 70):
    for x in range(cx - 70, cx + 70):
        if abs(x - cx) > 45 or abs(y - cy) > 45:
            surround_pixels.append(img.getpixel((x, y)))

avg_r = sum(p[0] for p in surround_pixels) / len(surround_pixels)
avg_g = sum(p[1] for p in surround_pixels) / len(surround_pixels)
avg_b = sum(p[2] for p in surround_pixels) / len(surround_pixels)

print(f"Surrounding background average: R={avg_r:.1f}, G={avg_g:.1f}, B={avg_b:.1f} (R-B={avg_r-avg_b:.1f}, R-G={avg_r-avg_g:.1f})")

# Center pixels
center_pixels = []
for y in range(cy - 35, cy + 35):
    for x in range(cx - 35, cx + 35):
        center_pixels.append(img.getpixel((x, y)))

c_avg_r = sum(p[0] for p in center_pixels) / len(center_pixels)
c_avg_g = sum(p[1] for p in center_pixels) / len(center_pixels)
c_avg_b = sum(p[2] for p in center_pixels) / len(center_pixels)

print(f"Center watermark average: R={c_avg_r:.1f}, G={c_avg_g:.1f}, B={c_avg_b:.1f} (R-B={c_avg_r-c_avg_b:.1f}, R-G={c_avg_r-c_avg_g:.1f})")
print(f"Delta added by watermark: delta_R={c_avg_r - avg_r:.1f}, delta_G={c_avg_g - avg_g:.1f}, delta_B={c_avg_b - avg_b:.1f}")

