import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

targets = [
  'PSU-GO', 'UFG/HC', 'CMC', 'UFPA/HUJBB', 'HU-FMJ',
  'UEL', 'Universidade Evangélica', 'Porto Alegre',
  'CERMAM', 'Sorocaba'
]

print("=== STATUS DAS 10 INSTITUIÇÕES DO LOTE 4 NO MAPEAMENTO DA PLATAFORMA ===")
for idx, item in enumerate(data, 1):
    inst = item['instituicao']
    for t in targets:
        if t.lower() in inst.lower():
            pct = item['percentual']
            faltam = item['sem_gabarito']
            print(f"Rank {idx:2d} | {inst[:45].ljust(46)} | Total: {str(item['total_questoes']).rjust(3)} | Gabaritadas: {str(item['total_resolvidas']).rjust(3)} | Faltam: {str(faltam).rjust(2)} | {pct}%")
            break
