from PIL import Image

crop = Image.open('data/user_q_watermark_crop.png').convert('RGB')
w, h = crop.size
cy = h // 2

# Profile along horizontal line y = cy
print("X position: R, G, B, R-B, R-G")
for x in range(0, w, 5):
    r, g, b = crop.getpixel((x, cy))
    print(f"x={x:2d}: R={r:3d}, G={g:3d}, B={b:3d} | R-B={r-b:2d}, R-G={r-g:2d}")

