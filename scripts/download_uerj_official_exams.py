import urllib.request, ssl, os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'data/official_exams/UERJ'
os.makedirs(out_dir, exist_ok=True)

files = [
    # 2025
    ('UERJ_2025_PROVA_ACESSO_DIRETO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/173301965438690794d0b8391f5e5029ba80cbee78e7ee39a/766307404.pdf'),
    ('UERJ_2025_GABARITO_DEFINITIVO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/173446515942074584d0b8391f5e5029ba80cbee78e7ee39a/706086236.pdf'),
    # 2024
    ('UERJ_2024_PROVA_ACESSO_DIRETO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/170035953370693964d0b8391f5e5029ba80cbee78e7ee39a/571175591.pdf'),
    ('UERJ_2024_GABARITO_DEFINITIVO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/170186794422906184d0b8391f5e5029ba80cbee78e7ee39a/1290307710.pdf'),
    # 2023
    ('UERJ_2023_PROVA_ACESSO_DIRETO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/166853482876865534d0b8391f5e5029ba80cbee78e7ee39a/1182905891.pdf'),
    ('UERJ_2023_GABARITO_DEFINITIVO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/167102534442406924d0b8391f5e5029ba80cbee78e7ee39a/977271862.pdf'),
    # 2022
    ('UERJ_2022_PROVA_ACESSO_DIRETO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/163698272712323604d0b8391f5e5029ba80cbee78e7ee39a/562101169.pdf'),
    ('UERJ_2022_GABARITO_DEFINITIVO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/163956401476019594d0b8391f5e5029ba80cbee78e7ee39a/309667234.pdf'),
    # 2026
    ('UERJ_2026_PROVA_ACESSO_DIRETO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/S04597_2026/79562cc62095e2ad3e2e7234cbae5148f5f003dc9edb0874c3cf5acaa504a1d1.pdf'),
    ('UERJ_2026_GABARITO_DEFINITIVO.pdf', 'https://www.cepuerj.uerj.br/uploads/concursos/S04597_2026/ff8c5d9122e1b1e2c1e607802372101232687c89c72ded205740da5a8859db66.pdf'),
]

for fname, url in files:
    fpath = os.path.join(out_dir, fname)
    if not os.path.exists(fpath):
        print(f"Downloading {fname} from {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, context=ctx, timeout=20).read()
            with open(fpath, 'wb') as f: f.write(data)
            print(f"Saved {fname} ({len(data)} bytes)")
        except Exception as e:
            print(f"Error {fname}: {e}")
    else:
        print(f"Already exists: {fname}")
