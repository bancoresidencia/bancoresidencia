from pypdf import PdfReader

reader = PdfReader("data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf")
page1 = reader.pages[0]

def visitor_body(text, cm, tm, font_dict, font_size):
    if text.strip():
        # tm[4] is x, tm[5] is y
        print(f"x={tm[4]:.1f}, y={tm[5]:.1f}: '{text.strip()}'")

print("--- TEXT ELEMENTS ON PAGE 1 ---")
# Print first 60 elements
count = 0
def visitor_sample(text, cm, tm, font_dict, font_size):
    global count
    if text.strip() and count < 80:
        print(f"x={tm[4]:.1f}, y={tm[5]:.1f}: '{text.strip()}'")
        count += 1

page1.extract_text(visitor_text=visitor_sample)

