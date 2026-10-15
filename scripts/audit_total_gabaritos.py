import json, glob, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 80)
print("AUDITORIA COMPLETA DE GABARITOS HOMOLOGADOS NO SISTEMA")
print("=" * 80)

# 1. Total nos arquivos de especialidades
files = sorted(glob.glob('data/*_final_questions.json'))
total_global = 0
homologadas_global = 0
anuladas_global = 0
sem_gabarito_global = 0

specialty_stats = {}

lote1_targets = [
    'SES-PE', 'Santa Casa de São Paulo', 'AMRIGS', 'SUS-SP', 'IAMSPE',
    'USP', 'USP-RP', 'UNESP', 'FMABC', 'UNIFESP'
]

lote1_stats = defaultdict(lambda: {
    'total': 0, 'com_gab': 0, 'anulada': 0, 'sem_gab': 0,
    'hist_total': 0, 'hist_com_gab': 0, 'hist_sem_gab': 0,
    'mod_total': 0, 'mod_com_gab': 0, 'mod_sem_gab': 0
})

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    
    spec_name = f.replace('data\\', '').replace('data/', '').replace('_final_questions.json', '')
    spec_total = len(qs)
    spec_gab = 0
    spec_anul = 0
    spec_sem = 0
    
    for q in qs:
        total_global += 1
        ans = str(q.get('correct_answer') or q.get('correctAnswer') or q.get('answer') or '').strip().upper()
        is_anul = bool(q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans))
        
        has_val = is_anul or (ans in ['A', 'B', 'C', 'D', 'E'])
        if is_anul:
            spec_anul += 1
            anuladas_global += 1
            homologadas_global += 1
        elif has_val:
            spec_gab += 1
            homologadas_global += 1
        else:
            spec_sem += 1
            sem_gabarito_global += 1
            
        # Lote 1 check
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        try:
            yr = int(yr)
        except:
            yr = 0
            
        matched = None
        inst_lower = inst.lower()
        if 'ses-pe' in inst_lower or 'secretaria de estado da saúde de pernambuco' in inst_lower:
            matched = 'SES-PE'
        elif 'santa casa de são paulo' in inst_lower or 'iscmsp' in inst_lower:
            matched = 'Santa Casa de São Paulo'
        elif 'amrigs' in inst_lower:
            matched = 'AMRIGS'
        elif 'sus-sp' in inst_lower:
            matched = 'SUS-SP'
        elif 'iamspe' in inst_lower:
            matched = 'IAMSPE'
        elif 'usp-rp' in inst_lower or 'hcrp' in inst_lower or 'ribeirão preto' in inst_lower:
            matched = 'USP-RP'
        elif 'usp' in inst_lower or 'fmusp' in inst_lower:
            matched = 'USP'
        elif 'unesp' in inst_lower:
            matched = 'UNESP'
        elif 'fmabc' in inst_lower or 'abc' in inst_lower:
            matched = 'FMABC'
        elif 'unifesp' in inst_lower or 'paulista de medicina' in inst_lower:
            matched = 'UNIFESP'
            
        if matched:
            s = lote1_stats[matched]
            s['total'] += 1
            if has_val:
                s['com_gab'] += 1
            else:
                s['sem_gab'] += 1
                
            if 2014 <= yr <= 2021:
                s['hist_total'] += 1
                if has_val:
                    s['hist_com_gab'] += 1
                else:
                    s['hist_sem_gab'] += 1
            elif yr >= 2022:
                s['mod_total'] += 1
                if has_val:
                    s['mod_com_gab'] += 1
                else:
                    s['mod_sem_gab'] += 1

    specialty_stats[spec_name] = {
        'total': spec_total, 'gab': spec_gab, 'anul': spec_anul, 'sem': spec_sem,
        'pct': (spec_gab + spec_anul) / spec_total * 100 if spec_total else 0
    }

# 2. Manifesto Ouro
gold_count = 0
try:
    with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as fp:
        gold_data = json.load(fp)
        gold_count = len(gold_data)
except Exception as e:
    gold_count = f"Erro: {e}"

print(f"\n📊 1. VISÃO GERAL GLOBAL DO BANCO DE DADOS:")
print(f"  • Total de questões catalogadas: {total_global:,}")
print(f"  • Questões com gabarito homologado: {homologadas_global:,} ({homologadas_global/total_global*100:.2f}%)")
print(f"      - Alternativas oficiais válidas (A/B/C/D/E): {homologadas_global - anuladas_global:,}")
print(f"      - Questões oficialmente anuladas: {anuladas_global:,}")
print(f"  • Questões pendentes sem gabarito: {sem_gabarito_global:,} ({sem_gabarito_global/total_global*100:.2f}%)")
print(f"  • Questões registradas no Manifesto Ouro (Gold): {gold_count:,}")

print(f"\n📚 2. GABARITOS POR ESPECIALIDADE:")
for spec, d in specialty_stats.items():
    print(f"  • {spec.replace('_', ' ').capitalize():<22}: {d['gab']+d['anul']:>6,} / {d['total']:>6,} ({d['pct']:>5.1f}%) | Pendentes: {d['sem']:>5,}")

print(f"\n🏆 3. SITUAÇÃO DO LOTE 1 (TOP 10 INSTITUIÇÕES):")
total_l1 = sum(s['total'] for s in lote1_stats.values())
com_gab_l1 = sum(s['com_gab'] for s in lote1_stats.values())
sem_gab_l1 = sum(s['sem_gab'] for s in lote1_stats.values())

total_hist_l1 = sum(s['hist_total'] for s in lote1_stats.values())
com_hist_l1 = sum(s['hist_com_gab'] for s in lote1_stats.values())
sem_hist_l1 = sum(s['hist_sem_gab'] for s in lote1_stats.values())

total_mod_l1 = sum(s['mod_total'] for s in lote1_stats.values())
com_mod_l1 = sum(s['mod_com_gab'] for s in lote1_stats.values())
sem_mod_l1 = sum(s['mod_sem_gab'] for s in lote1_stats.values())

print(f"  • Total Lote 1 Geral (Todos os anos): {com_gab_l1:,} / {total_l1:,} ({com_gab_l1/total_l1*100:.2f}%) | Faltam: {sem_gab_l1:,}")
print(f"  • Lote 1 - Recente (2022 a 2026)    : {com_mod_l1:,} / {total_mod_l1:,} ({com_mod_l1/total_mod_l1*100:.2f}%) | Faltam: {sem_mod_l1:,}")
print(f"  • Lote 1 - Histórico (2014 a 2021)  : {com_hist_l1:,} / {total_hist_l1:,} ({com_hist_l1/total_hist_l1*100:.2f}%) | Faltam: {sem_hist_l1:,}")

print(f"\n📋 4. DETALHE POR INSTITUIÇÃO DO LOTE 1:")
for target in lote1_targets:
    s = lote1_stats[target]
    pct_total = s['com_gab'] / s['total'] * 100 if s['total'] else 0
    pct_hist = s['hist_com_gab'] / s['hist_total'] * 100 if s['hist_total'] else 0
    pct_mod = s['mod_com_gab'] / s['mod_total'] * 100 if s['mod_total'] else 0
    print(f"  • {target:<26}: Geral={pct_total:>5.1f}% ({s['com_gab']:>4}/{s['total']:<4}) | Histórico (2014-21)={pct_hist:>5.1f}% ({s['hist_com_gab']:>4}/{s['hist_total']:<4}) | Recente (2022+)={pct_mod:>5.1f}% ({s['mod_com_gab']:>4}/{s['mod_total']:<4})")

print("=" * 80)
