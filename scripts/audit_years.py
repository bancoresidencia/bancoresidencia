import os, glob, json, sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

specialty_files = glob.glob('data/*_final_questions.json')
specialty_files = [f for f in specialty_files if 'backup' not in f]

stats_por_ano = defaultdict(lambda: defaultdict(lambda: {'total': 0, 'com_gabarito': 0, 'anuladas': 0, 'sem_gabarito': 0}))

for sf in specialty_files:
    with open(sf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = q.get('institution') or q.get('banca') or ''
        inst_u = inst.upper()
        banca_cat = None
        if 'INEP' in inst_u:
            banca_cat = 'INEP Revalida'
        elif 'ENARE' in inst_u or 'ENAMED' in inst_u:
            # Let's separate ENARE vs ENAMED if distinct, or show exact string
            banca_cat = inst
        elif 'REVALIDA' in inst_u:
            banca_cat = inst
            
        if not banca_cat:
            continue
            
        ano = q.get('year') or 'Sem ano'
        ans = (q.get('correct_answer') or q.get('correctAnswer') or '').strip()
        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada') or ans.upper() in ['ANULADA', 'NULA', 'X'])
        has_ans = bool(ans and not is_anulada)
        
        stats_por_ano[banca_cat][ano]['total'] += 1
        if is_anulada:
            stats_por_ano[banca_cat][ano]['anuladas'] += 1
        elif has_ans:
            stats_por_ano[banca_cat][ano]['com_gabarito'] += 1
        else:
            stats_por_ano[banca_cat][ano]['sem_gabarito'] += 1

print("="*75)
print("1. GABARITOS PRESENTES NO BANCO DE DADOS (POR BANCA E POR ANO)")
print("="*75)

for banca in sorted(stats_por_ano.keys()):
    if not any(k in banca.upper() for k in ['INEP', 'ENARE', 'ENAMED']):
        continue
    print(f"\n📌 {banca}")
    anos_dict = stats_por_ano[banca]
    total_banca = sum(d['total'] for d in anos_dict.values())
    resolv_banca = sum(d['com_gabarito'] + d['anuladas'] for d in anos_dict.values())
    pct_banca = round(resolv_banca / total_banca * 100, 1) if total_banca > 0 else 0
    print(f"   [TOTAL GERAL DA BANCA: {resolv_banca}/{total_banca} ({pct_banca}% resolvidas)]")
    
    for ano in sorted(anos_dict.keys(), key=lambda x: str(x)):
        d = anos_dict[ano]
        res = d['com_gabarito'] + d['anuladas']
        pct = round(res / d['total'] * 100, 1) if d['total'] > 0 else 0
        status_icon = "🟢" if pct >= 90 else ("🟡" if pct >= 40 else "🔴")
        print(f"   {status_icon} Ano {str(ano).ljust(6)}: {res:>4}/{d['total']:<4} ({pct:>5.1f}%) | Gabaritos: {d['com_gabarito']:>3} | Anuladas: {d['anuladas']:>2} | Faltam: {d['sem_gabarito']:>3}")

print("\n" + "="*75)
print("2. ARQUIVOS OFICIAIS DE GABARITO (PDFs) EM DISCO (data/official_exams)")
print("="*75)

for folder, name in [('INEP_REVALIDA', 'INEP Revalida'), ('ENARE', 'ENARE')]:
    p = os.path.join('data', 'official_exams', folder)
    print(f"\n📂 Arquivos em {p} ({name}):")
    if os.path.exists(p):
        gbs = [f for f in os.listdir(p) if any(k in f.lower() for k in ['gb', 'gabarito']) or (f.endswith('.pdf') and not f.endswith('_PV.pdf') and not 'pv' in f.lower())]
        pvs = [f for f in os.listdir(p) if 'pv' in f.lower()]
        print("  • Gabaritos oficiais em PDF:")
        for f in sorted(gbs):
            sz = os.path.getsize(os.path.join(p, f))
            print(f"    - {f} ({sz/1024:.1f} KB)")
        print(f"  • Total Cadernos de Prova (PV): {len(pvs)} cadernos")
