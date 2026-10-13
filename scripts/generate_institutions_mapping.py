import glob, json, sys, os
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

specialty_files = glob.glob('data/*_final_questions.json')
specialty_files = [f for f in specialty_files if 'backup' not in f]

inst_stats = defaultdict(lambda: {'total': 0, 'com_gabarito': 0, 'anuladas': 0, 'sem_gabarito': 0})

for sf in specialty_files:
    with open(sf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = q.get('institution') or q.get('banca') or 'Não informada'
        ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada') or ans.upper() in ['ANULADA', 'NULA', 'X'])
        has_ans = bool(ans and not is_anulada)
        
        inst_stats[inst]['total'] += 1
        if is_anulada:
            inst_stats[inst]['anuladas'] += 1
        elif has_ans:
            inst_stats[inst]['com_gabarito'] += 1
        else:
            inst_stats[inst]['sem_gabarito'] += 1

sorted_inst = sorted(inst_stats.items(), key=lambda x: (-(x[1]['com_gabarito'] + x[1]['anuladas']), -x[1]['total']))

out_list = []
for name, s in sorted_inst:
    res = s['com_gabarito'] + s['anuladas']
    pct = round(res / s['total'] * 100, 1) if s['total'] > 0 else 0
    out_list.append({
        'instituicao': name,
        'total_questoes': s['total'],
        'com_gabarito_valido': s['com_gabarito'],
        'anuladas': s['anuladas'],
        'total_resolvidas': res,
        'sem_gabarito': s['sem_gabarito'],
        'percentual': pct
    })

with open('data/mapeamento_instituicoes_gabaritos.json', 'w', encoding='utf-8') as f:
    json.dump(out_list, f, ensure_ascii=False, indent=2)

md_lines = []
md_lines.append('# Mapeamento Completo de Questões com Gabarito por Instituição')
md_lines.append('')
md_lines.append(f'* **Total de Instituições:** {len(out_list)}')
total_q = sum(x['total_questoes'] for x in out_list)
total_res = sum(x['total_resolvidas'] for x in out_list)
total_gab = sum(x['com_gabarito_valido'] for x in out_list)
total_anul = sum(x['anuladas'] for x in out_list)
md_lines.append(f'* **Total de Questões no Banco:** {total_q:,}')
md_lines.append(f'* **Total com Gabarito/Resolvidas:** {total_res:,} ({round(total_res/total_q*100, 2)}%)')
md_lines.append(f'* **Gabaritos Válidos:** {total_gab:,} | **Anuladas Oficiais:** {total_anul:,}')
md_lines.append('')
md_lines.append('| # | Instituição / Banca | Com Gabarito | Anuladas | Total Resolvidas | Total no Banco | % Cobertura |')
md_lines.append('| :---: | :--- | :---: | :---: | :---: | :---: | :---: |')

for idx, item in enumerate(out_list, 1):
    md_lines.append(f"| {idx} | {item['instituicao']} | {item['com_gabarito_valido']} | {item['anuladas']} | **{item['total_resolvidas']}** | {item['total_questoes']} | {item['percentual']}% |")

with open('data/mapeamento_completo_instituicoes_gabaritos.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print(f"Sucesso! {len(out_list)} instituições processadas.")
print(f"Total de questões: {total_q:,}")
print(f"Total com gabarito: {total_res:,} ({round(total_res/total_q*100, 2)}%)")
