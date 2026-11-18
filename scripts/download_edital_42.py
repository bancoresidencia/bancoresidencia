import os, requests

os.makedirs('data/incoming_exams/Selecting_42', exist_ok=True)
files = [
    ('data/incoming_exams/Selecting_42/PV_EDITAL_42_VERSAO_1A.pdf', 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/42/24c3c1700a1066c6029b53fd6deee987.pdf'),
    ('data/incoming_exams/Selecting_42/GB_EDITAL_42_VERSAO_1A.pdf', 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/42/458de76a0a5ea008e5da4a38106405a6.pdf')
]

for name, url in files:
    print('Downloading', name)
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
    print('Status:', r.status_code, 'len:', len(r.content))
    if r.status_code == 200:
        with open(name, 'wb') as fp:
            fp.write(r.content)
        print('Saved', name)
