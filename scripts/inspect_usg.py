from PIL import Image

img = Image.open('data/test_usp_189c_stmt.webp').convert('RGB')
w, h = img.size
cx, cy = w // 2, h // 2

crop = img.crop((cx - 60, cy - 60, cx + 60, cy + 60))
crop.save('data/usg_center_crop.png')
print('USG center crop saved to data/usg_center_crop.png')
