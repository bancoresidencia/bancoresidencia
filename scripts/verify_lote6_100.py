import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

targets = [
  'Universidade do Estado do Pará - Belém',
  'SMS-SP - Secretaria Municipal de Saúde de São Paulo',
  'HAC - Hospital Angelina Caron (PR)',
  'UnB/HUB - Hospital Universitário de Brasília (DF)',
  'Fundhacre - Fundação Hospital Estadual do Acre',
  'UFS/HU - Hospital Universitário de Sergipe - Aracaju (SE)',
  'IOG - Instituto de Olhos de Goiânia',
  'Universidade de Ribeirão Preto',
  'HEDA - Hospital Estadual Dirceu Arcoverde (PI)',
  'UFMT/HUJM - Hospital Universitário Júlio Müller - Cuiabá (MT)'
]

print("=== VERIFICAÇÃO DAS 10 INSTITUIÇÕES DO LOTE 6 ===")
for idx, item in enumerate(d, 1):
    if item['instituicao'] in targets:
        inst = item['instituicao']
        tot = item['total_questoes']
        res = item['total_resolvidas']
        faltam = item['sem_gabarito']
        pct = item['percentual']
        print(f"Rank {str(idx).rjust(2)} | {inst[:45].ljust(46)} | Total: {str(tot).rjust(3)} | Gabaritadas: {str(res).rjust(3)} | Faltam: {str(faltam).rjust(2)} | {pct}%")
