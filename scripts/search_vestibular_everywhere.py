import os
import pypdf

for root, dirs, files in os.walk('data'):
    for f in files:
        if f.lower().endswith('.pdf'):
            p = os.path.join(root, f)
            try:
                reader = pypdf.PdfReader(p)
                for idx, page in enumerate(reader.pages):
                    ptxt = page.extract_text()
                    if ptxt and 'vestibular' in ptxt.lower():
                        print(f"🎯 ENCONTRADO em {p} (pág {idx+1})!")
                        for l in ptxt.split('\n'):
                            if 'vestibular' in l.lower():
                                print("   ", l.strip())
            except:
                pass
