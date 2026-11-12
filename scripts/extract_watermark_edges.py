from PIL import Image, ImageFilter, ImageEnhance, ImageOps

img = Image.open('data/test_user_question_24d1.webp').convert('RGB')
w, h = img.size
cx, cy = w // 2, h // 2

bw, bh = 140, 140
center_crop = img.crop((cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2))

# Convert to grayscale and enhance edges
gray = center_crop.convert('L')
blurred = gray.filter(ImageFilter.GaussianBlur(radius=5))
diff = ImageOps.invert(ImageChops.difference(gray, blurred) if 'ImageChops' in dir() else Image.eval(gray, lambda x: x))

from PIL import ImageChops
diff = ImageChops.difference(gray, blurred)
enhanced = ImageEnhance.Contrast(diff).enhance(4.0)

enhanced.save('data/watermark_edges_extracted.png')
print("Edges extracted to data/watermark_edges_extracted.png")

