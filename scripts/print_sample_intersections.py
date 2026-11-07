import json

with open('data/staging/auditoria_intersecoes_focos.json', 'r', encoding='utf-8') as fp:
    data = json.load(fp)

print('=== AMOSTRA DE FOCOS COM INTERSECAO POR ESPECIALIDADE ===')
esps = sorted(list(set(t['especialidade'] for t in data['detalhes_por_tema'])))

for esp in esps:
    print('\n' + '=' * 70)
    print(f"ESPECIALIDADE: {esp.upper()}")
    print('=' * 70)
    temas = [t for t in data['detalhes_por_tema'] if t['especialidade'] == esp]
    for t in temas[:3]:
        print(f"\nTema: {t['tema']} ({t['total_focos_no_tema']} focos | {t['qtd_pares']} pares com intersecao)")
        sorted_pairs = sorted(t['pares'], key=lambda p: (p['total_maior'] + p['total_menor']), reverse=True)
        seen = set()
        c = 0
        for p in sorted_pairs:
            pair_k = tuple(sorted([p['foco_maior'], p['foco_menor']]))
            if pair_k in seen:
                continue
            seen.add(pair_k)
            print(f"  * Foco Principal ({p['total_maior']} q): \"{p['foco_maior']}\"")
            print(f"    -> Foco Satelite  ({p['total_menor']} q): \"{p['foco_menor']}\"")
            print(f"    [Tipos: {', '.join(p['tipologia'])} | Nucleo: {p['termos_comuns']}]")
            c += 1
            if c >= 3:
                break
