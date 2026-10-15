from pypdf import PdfReader
import glob, os

files = [
    'data/official_exams/AMRIGS/AMRIGS_315_315_Gab_Oficial_AcessoDireto.pdf',
    'data/official_exams/AMRIGS/AMRIGS_407_Gabarito_Definitivo_Acesso_Direto_Autoavaliacao.pdf',
    'data/official_exams/AMRIGS/AMRIGS_140_GABARITO_OFICIAL_AMRIGS.pdf'
]

for f in files:
    if os.path.exists(f):
        reader = PdfReader(f)
        text = reader.pages[0].extract_text()
        print(f"=== {f} ===")
        print(text[:400])
        print("...")
