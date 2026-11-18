import pypdf
import os
import re

def extract_items_from_pdf(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    # Let's find each item:
    # Pattern: a line starting with number 1..120
    # In Cebraspe: "\n47 Etiologias..." or "\n 47 Etiologias..."
    # Let's locate all occurrences of "\n\s*(\d{1,3})\s+([A-ZÀ-Ú])"
    matches = list(re.finditer(r'(?:\n|^)\s*(\d{1,3})\s+([A-ZÀ-Ú])', full_text))
    
    # Filter to only strictly sequential or expected item numbers 1..120
    items = {}
    for i, m in enumerate(matches):
        num = int(m.group(1))
        if 1 <= num <= 120:
            start_pos = m.start()
            end_pos = matches[i+1].start() if i+1 < len(matches) else len(full_text)
            item_text = full_text[start_pos:end_pos].strip()
            # Clean up linebreaks and excess spaces
            item_text_clean = ' '.join(item_text.split())
            items[num] = item_text_clean
            
    return items

folder = 'data/incoming_exams/SES_DF_2016'
for ef in ['138RMUNIF_001_01.pdf', '138RMUNIF_002_02.pdf']:
    path = os.path.join(folder, ef)
    items = extract_items_from_pdf(path)
    print(f"{ef}: extracted {len(items)} items")
    print(f"  Item 47: {items.get(47)}")
