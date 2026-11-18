import pypdf

reader = pypdf.PdfReader('data/incoming_exams/macae_gb_2.pdf')
full_text = '\n'.join(p.extract_text() for p in reader.pages)
print(full_text)
