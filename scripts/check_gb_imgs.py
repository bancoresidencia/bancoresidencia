from PIL import Image

for p in [1, 2, 3]:
    for img_idx in [1, 2, 3]:
        fname = f"data/gb_p{p}_img{img_idx}.png"
        try:
            im = Image.open(fname)
            print(f"{fname}: {im.size}, mode={im.mode}")
        except FileNotFoundError:
            pass

