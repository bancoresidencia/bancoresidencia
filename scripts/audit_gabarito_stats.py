import os, glob, json
from collections import defaultdict

specialty_files = glob.glob('data/*_final_questions.json')
specialty_files = [f for f in specialty_files if 'backup' not in f]

total_all = 0
with_ans_all = 0
anulada_all = 0

institutions_stats = defaultdict(lambda: {'total': 0, 'with_ans': 0, 'anulada': 0, 'no_ans': 0})
specialties_stats = {}

for sf in sorted(specialty_files):
    s_name = os.path.basename(sf).replace('_final_questions.json', '')
    with open(sf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    s_total = len(data)
    s_with_ans = 0
    s_anulada = 0
    
    for q in data:
        ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada') or ans.upper() in ['ANULADA', 'NULA', 'X'])
        has_ans = bool(ans and not is_anulada)
        
        inst = q.get('institution') or q.get('banca') or 'Outra'
        
        total_all += 1
        
        if is_anulada:
            anulada_all += 1
            s_anulada += 1
            institutions_stats[inst]['anulada'] += 1
        elif has_ans:
            with_ans_all += 1
            s_with_ans += 1
            institutions_stats[inst]['with_ans'] += 1
        else:
            institutions_stats[inst]['no_ans'] += 1
            
        institutions_stats[inst]['total'] += 1
        
    resolved_s = s_with_ans + s_anulada
    pct_s = round(resolved_s / s_total * 100, 2) if s_total > 0 else 0
    specialties_stats[s_name] = {
        'total': s_total,
        'with_ans': s_with_ans,
        'anulada': s_anulada,
        'resolved': resolved_s,
        'pct': pct_s
    }

resolved_all = with_ans_all + anulada_all
pct_all = round(resolved_all / total_all * 100, 2) if total_all > 0 else 0

print("="*60)
print("RELATÓRIO GERAL DE GABARITOS (TODAS AS ESPECIALIDADES)")
print("="*60)
print(f"Total de questoes no banco: {total_all:,}")
print(f"Com gabarito valido:       {with_ans_all:,}")
print(f"Anuladas (oficial):        {anulada_all:,}")
print(f"Total com solucao:         {resolved_all:,}")
print(f"Sem gabarito (pendentes):  {total_all - resolved_all:,}")
print(f"Taxa de cobertura (%):     {pct_all}%")
print("="*60)

print("\n--- POR ESPECIALIDADE ---")
for s, st in specialties_stats.items():
    print(f"{s.ljust(22)}: {st['resolved']:,} / {st['total']:,} ({st['pct']}%) [Gabarito: {st['with_ans']:,} | Anuladas: {st['anulada']:,}]")

print("\n" + "="*60)
print("FOCO: REVALIDA, INEP, ENARE, ENAMED")
print("="*60)

target_institutions = {}
for inst, st in institutions_stats.items():
    inst_lower = inst.lower()
    if any(k in inst_lower for k in ['inep', 'revalida', 'enare', 'enamed', 'named']):
        res = st['with_ans'] + st['anulada']
        pct = round(res / st['total'] * 100, 2) if st['total'] > 0 else 0
        target_institutions[inst] = {**st, 'resolved': res, 'pct': pct}

for inst, st in sorted(target_institutions.items(), key=lambda x: -x[1]['total']):
    print(f"\nInstituicao/Banca: {inst}")
    print(f"  • Total Questoes: {st['total']:,}")
    print(f"  • Com Gabarito:   {st['with_ans']:,}")
    print(f"  • Anuladas:       {st['anulada']:,}")
    print(f"  • Resolvidas:     {st['resolved']:,} ({st['pct']}%)")
    print(f"  • Faltando:       {st['no_ans']:,}")

with open('data/audit_gabaritos_resumo.json', 'w', encoding='utf-8') as f:
    json.dump({
        'geral': {
            'total': total_all,
            'with_ans': with_ans_all,
            'anulada': anulada_all,
            'resolved': resolved_all,
            'pending': total_all - resolved_all,
            'pct': pct_all
        },
        'especialidades': specialties_stats,
        'alvo': target_institutions
    }, f, ensure_ascii=False, indent=2)
