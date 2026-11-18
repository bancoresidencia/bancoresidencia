import glob
import pypdf
import os

pdf_files = glob.glob('data/**/*.pdf', recursive=True)
print(f"Total PDFs in data: {len(pdf_files)}", flush=True)

target_phrases = ["área valvar aórtica de 0,9", "pulso parvo e tardus", "síndrome da artéria cerebral posterior", "teste de hints"]

for pdf in pdf_files:
    try:
        reader = pypdf.PdfReader(pdf)
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if not text: continue
            text_lower = text.lower()
            for phrase in target_phrases:
                if phrase in text_lower:
                    print(f"🎯 MATCH FOUND! Phrase '{phrase}' in {pdf} (page {page_idx+1})!", flush=True)
                    lines = [l.strip() for l in text.split('\n') if phrase in l.lower()]
                    print("  Snippet:", lines[0] if lines else "")
    except:
        pass

print("Scan complete.", flush=True)
