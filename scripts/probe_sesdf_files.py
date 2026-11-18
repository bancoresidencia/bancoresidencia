import urllib.request
import os

base = 'http://www.cespe.unb.br/concursos/ses_df_16_residencia/arquivos/'

headers = {'User-Agent': 'Mozilla/5.0'}

os.makedirs('data/incoming_exams/SES_DF_2016', exist_ok=True)

for i in range(1, 25):
    # Pattern: 138RMUNIF_001_01.pdf
    fn = f'138RMUNIF_{i:03d}_{i:02d}.pdf'
    url = base + fn
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            out_path = f'data/incoming_exams/SES_DF_2016/{fn}'
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"✅ Baixado: {fn} ({len(data)} bytes)")
            
            # Now try gabarito: GAB_DEFINITIVO_138RMUNIF_{i:03d}_{i:02d}.PDF
            # and variations
            for gname in [f'GAB_DEFINITIVO_138RMUNIF_{i:03d}_{i:02d}.PDF', f'Gab_Definitivo_138RMUNIF_{i:03d}_{i:02d}.pdf']:
                gurl = base + gname
                try:
                    greq = urllib.request.Request(gurl, headers=headers)
                    with urllib.request.urlopen(greq, timeout=5) as gresp:
                        gdata = gresp.read()
                        with open(f'data/incoming_exams/SES_DF_2016/{gname}', 'wb') as gf:
                            gf.write(gdata)
                        print(f"   🎯 Gabarito baixado: {gname} ({len(gdata)} bytes)")
                        break
                except:
                    pass
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print(f"  {fn}: HTTP {e.code}")
    except Exception as e:
        pass
