import os

print("=== EXAMS DOWNLOADED ON DISK ===")
base = 'data/incoming_exams'
if os.path.exists(base):
    for d in sorted(os.listdir(base)):
        dp = os.path.join(base, d)
        if os.path.isdir(dp):
            files = os.listdir(dp)
            pdfs = [f for f in files if f.lower().endswith('.pdf')]
            print(f"Folder: {d} ({len(pdfs)} PDFs)")
            for p in pdfs[:6]:
                print(f"   {p}")
            if len(pdfs) > 6:
                print(f"   ... and {len(pdfs)-6} more")
