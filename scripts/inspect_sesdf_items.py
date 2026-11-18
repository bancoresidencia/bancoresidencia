import pypdf
import re

for fn in ['138RMUNIF_001_01.pdf', '138RMUNIF_002_02.pdf']:
    path = f'data/incoming_exams/SES_DF_2016/{fn}'
    reader = pypdf.PdfReader(path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    print(f"\n=================== {fn} ===================")
    
    # Check for lines starting with numbers
    # Cebraspe items usually start with a number followed by space: "\n47 " or "\n 47 "
    items = []
    # Let's search pattern for item numbers 1 to 120
    for num in range(1, 121):
        m = re.search(rf'(?:^|\n)\s*{num}\s+([^\n]+)', full_text)
        if m:
            items.append((num, m.group(1)[:60]))
    print(f"Found {len(items)} items by regex ^num in {fn}")
    for it in items[:10]:
        print(f"  Item {it[0]}: {it[1]}")
    if len(items) > 10:
        print(f"  ... Item {items[-1][0]}: {items[-1][1]}")
