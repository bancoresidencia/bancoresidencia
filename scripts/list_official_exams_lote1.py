import os, glob

folders = ['AMRIGS', 'SUS_SP', 'IAMSPE', 'SANTA_CASA_SP', 'UNESP', 'FMABC', 'UNIFESP', 'USP_FUVEST']
for f in folders:
    p = os.path.join('data', 'official_exams', f)
    if os.path.exists(p):
        files = os.listdir(p)
        print(f"\n=== {f} ({len(files)} files) ===")
        for file in sorted(files):
            print(f"  {file}")
    else:
        print(f"\n=== {f} (DIR NOT FOUND) ===")
