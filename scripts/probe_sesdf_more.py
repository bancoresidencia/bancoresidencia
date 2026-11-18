import urllib.request

base = 'http://www.cespe.unb.br/concursos/ses_df_16_residencia/arquivos/'
headers = {'User-Agent': 'Mozilla/5.0'}

# Test 1 to 50
valid_files = []
for i in range(1, 51):
    # Could it be 138RMUNIF_007_07.pdf or 138RMUNIF_010_10.pdf etc.
    # Note: the second number might not equal the first number!
    # What if it's 138RMUNIF_007_01.pdf or something?
    # Let's test varying second number or checking cargo list
    for j in [i, 1, 2]:
        fn = f'138RMUNIF_{i:03d}_{j:02d}.pdf'
        url = base + fn
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                print(f"FOUND: {fn} ({resp.headers.get('Content-Length')} bytes)")
                valid_files.append(fn)
                break
        except urllib.error.HTTPError as e:
            pass
        except Exception as e:
            pass
print("Done probing. Found:", valid_files)
