from pypdf import PdfReader
from collections import defaultdict

reader = PdfReader("data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf")

def dump_page_table(page_idx):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        t = text.strip()
        if t:
            items.append((tm[4], tm[5], t))

    reader.pages[page_idx].extract_text(visitor_text=visitor)
    
    # Cluster by y rounded to nearest integer
    # Group items within 4 points of y
    rows = []
    # sort by y descending
    items.sort(key=lambda it: -it[1])
    
    current_row = []
    current_y = None
    for x, y, t in items:
        if current_y is None or abs(y - current_y) <= 4:
            current_row.append((x, y, t))
            if current_y is None:
                current_y = y
        else:
            current_row.sort(key=lambda it: it[0]) # sort by x ascending
            rows.append((current_y, current_row))
            current_row = [(x, y, t)]
            current_y = y
    if current_row:
        current_row.sort(key=lambda it: it[0])
        rows.append((current_y, current_row))
    
    print(f"\n=================== PAGE {page_idx+1} ROWS ===================")
    for y, r in rows:
        row_str = "  |  ".join(f"{it[2]} (x={it[0]:.1f})" for it in r)
        print(f"y={y:.1f}: {row_str}")

dump_page_table(0)

