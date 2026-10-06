import pypdf
import json

reader = pypdf.PdfReader('d:/bancoresidencia/data/enare_test/enare_2023_prova.pdf')
print(f'Total pages: {len(reader.pages)}')

# Inspect text of first 3 pages
sample_text = ""
for i in range(min(5, len(reader.pages))):
    page_text = reader.pages[i].extract_text() or ""
    print(f"--- Page {i+1} (length: {len(page_text)}) ---")
    print(page_text[:400])
    print("...")

with open('d:/bancoresidencia/data/enare_test/sample_page_2.txt', 'w', encoding='utf-8') as f:
    f.write(reader.pages[1].extract_text() or "")
print("Saved page 2 text.")
