import urllib.request, ssl, re, os, json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_url = 'https://med.estrategia.com/portal/residencia-medica/provas/'
req = urllib.request.Request(base_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

print("Fetching Estratégia MED proofs directory...")
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Find all links to sub-pages
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links on main directory: {len(links)}")

bancas_lote2 = [
    'psu-mg', 'unicamp', 'uerj', 'amp', 'amrigs', 'surce', 'einstein',
    'ses-go', 'ses-df', 'uel', 'cops', 'ses-rj', 'cermam', 'famerp', 'fmj'
]

sub_pages = []
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    for b in bancas_lote2:
        if b in href.lower():
            sub_pages.append((clean, href))
            break

# Deduplicate
sub_pages = list({url: name for name, url in sub_pages}.items())
print(f"\nEncontradas {len(sub_pages)} páginas de provas para bancas do Lote 2:")
for url, name in sub_pages:
    print(f"  • {name} -> {url}")

# Now for each page, find PDFs of exams and gabaritos
results = []
for url, name in sub_pages:
    print(f"\nVarrendo: {name} ({url})...")
    try:
        sub_req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        sub_html = urllib.request.urlopen(sub_req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        pdf_links = re.findall(r'href=[\'"]([^\'"]+\.pdf)[\'"]', sub_html, re.I)
        pdf_links = list(set(pdf_links))
        print(f"   -> {len(pdf_links)} PDFs encontrados")
        for p in pdf_links:
            is_relevant = any(k in p.lower() for k in ['prova', 'caderno', 'gabarito', 'definitivo', 'acesso', 'geral'])
            if is_relevant:
                results.append({'source_page': url, 'banca_label': name, 'pdf_url': p})
                print(f"      📄 {p}")
    except Exception as e:
        print(f"   ❌ Erro ao acessar: {e}")

out_path = 'data/lote2_estrategia_discovered_pdfs.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n========================================================")
print(f"Total de PDFs oficiais do Lote 2 descobertos: {len(results)}")
print(f"Salvo em: {out_path}")
print(f"========================================================")
