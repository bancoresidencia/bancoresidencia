import json, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
]

# Definição das 10 instituições do Lote 1
lote1_defs = {
    'SES-PE': lambda inst: 'SES-PE' in inst,
    'SUS-SP': lambda inst: 'SUS-SP' in inst,
    'IAMSPE': lambda inst: 'IAMSPE' in inst or 'HSPE' in inst,
    'Santa Casa SP (ISCMSP)': lambda inst: 'SANTA CASA DE SÃO PAULO' in inst or 'ISCMSP' in inst or 'FCMSCSP' in inst,
    'USP / HCFMUSP (SP)': lambda inst: 'HCFMUSP' in inst or ('USP' in inst and 'FMUSP' in inst),
    'USP / HCRP (Ribeirão)': lambda inst: 'HCRP' in inst or ('RIBEIRÃO' in inst and 'USP' in inst),
    'UNESP Botucatu': lambda inst: 'UNESP' in inst or 'BOTUCATU' in inst,
    'Centro Universitário FMABC': lambda inst: 'FMABC' in inst,
    'UNIFESP / EPM': lambda inst: 'UNIFESP' in inst or 'ESCOLA PAULISTA' in inst,
    'AMRIGS': lambda inst: 'AMRIGS' in inst
}

stats = {name: {'total': 0, 'answered': 0, 'unanswered': 0, 'by_year': defaultdict(lambda: {'total': 0, 'ans': 0})} for name in lote1_defs}
all_lote1_ids = set()

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = (q.get('institution') or '').upper()
        yr = q.get('year')
        has_ans = bool((q.get('correct_answer') or q.get('correctAnswer') or '').strip() or q.get('is_anulada') or q.get('isAnulada'))
        
        for name, match_fn in lote1_defs.items():
            if match_fn(inst):
                qid = q.get('id')
                if qid and qid in all_lote1_ids:
                    pass
                else:
                    if qid: all_lote1_ids.add(qid)
                    stats[name]['total'] += 1
                    stats[name]['by_year'][yr]['total'] += 1
                    if has_ans:
                        stats[name]['answered'] += 1
                        stats[name]['by_year'][yr]['ans'] += 1
                    else:
                        stats[name]['unanswered'] += 1
                break

print("="*80)
print("📊 CENSO COMPLETO E DETALHADO DO LOTE 1 (TOP 10 INSTITUIÇÕES)")
print("="*80)

total_lote1 = 0
answered_lote1 = 0

for name, s in stats.items():
    pct = (s['answered'] / s['total'] * 100) if s['total'] > 0 else 0
    total_lote1 += s['total']
    answered_lote1 += s['answered']
    print(f"\n📌 {name}:")
    print(f"   • Total no banco: {s['total']} questões")
    print(f"   • Homologadas (com gabarito): {s['answered']} ({pct:.2f}%)")
    print(f"   • Faltam homologar: {s['unanswered']} questões")
    
    years_summary = []
    for y in sorted(s['by_year'].keys(), key=lambda x: str(x)):
        y_info = s['by_year'][y]
        y_tot = y_info['total']
        y_ans = y_info['ans']
        y_pct = (y_ans / y_tot * 100) if y_tot > 0 else 0
        status_icon = "🟢" if y_ans == y_tot else ("🟡" if y_ans > 0 else "🔴")
        years_summary.append(f"{y}: {status_icon} {y_ans}/{y_tot} ({y_pct:.0f}%)")
    print("   • Detalhamento por Ano:")
    print("     " + " | ".join(years_summary[:6]))
    if len(years_summary) > 6:
        print("     " + " | ".join(years_summary[6:]))

pct_overall = (answered_lote1 / total_lote1 * 100) if total_lote1 > 0 else 0
unans_overall = total_lote1 - answered_lote1

print("\n" + "="*80)
print("🏆 CONSOLIDAÇÃO GERAL DO LOTE 1")
print("="*80)
print(f"• Total Geral de Questões cadastradas no Lote 1: {total_lote1}")
print(f"• Total Homologadas e com Gabarito Oficial:      {answered_lote1} ({pct_overall:.2f}%)")
print(f"• Total Pendente para 100% de todos os anos:     {unans_overall} ({(100 - pct_overall):.2f}%)")
print("="*80)
