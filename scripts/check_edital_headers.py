import os
import sys
import glob
import pypdf

for edital in [35, 36, 41, 42, 43]:
    pv_files = glob.glob(f"data/incoming_exams/Selecting_{edital}/*PV*.pdf")
    if pv_files:
        pv = sorted(pv_files)[0]
        try:
            reader = pypdf.PdfReader(pv)
            first_page = reader.pages[0].extract_text()
            lines = [l.strip() for l in first_page.split('\n') if l.strip()][:15]
            print(f"\n=== EDITAL {edital} ({os.path.basename(pv)}) ===", flush=True)
            for l in lines:
                print("  ", l, flush=True)
        except Exception as e:
            print(f"Error on edital {edital}: {e}", flush=True)
