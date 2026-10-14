import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

lote0 = [m for m in mapping if 'revalida' in m['instituicao'].lower() or 'enare' in m['instituicao'].lower() or 'enamed' in m['instituicao'].lower()]
others = [m for m in mapping if m not in lote0]

target_lotes = [15, 16, 17, 18, 19, 20, 27, 28]
chunk_size = 10

target_instituicoes = []
print("=== LEVANTAMENTO DOS LOTES SOLICITADOS ===")
for l in target_lotes:
    start = (l - 1) * chunk_size
    chunk = others[start:start + chunk_size]
    tot_q = sum(c['total_questoes'] for c in chunk)
    tot_res = sum(c['total_resolvidas'] for c in chunk)
    tot_faltam = sum(c['sem_gabarito'] for c in chunk)
    print(f"\nLote {l:2d}: Total: {tot_q:4d} | Resolvidas: {tot_res:4d} | Faltam: {tot_faltam:4d}")
    for c in chunk:
        target_instituicoes.append(c['instituicao'])
        if c['sem_gabarito'] > 0:
            print(f"   • {c['instituicao'][:45].ljust(46)} | Total: {str(c['total_questoes']).rjust(3)} | Faltam: {str(c['sem_gabarito']).rjust(3)}")

# Também checar instituições do Lote 4 original
lote4_chunk = others[30:40]
print("\n=== RESÍDUOS DO LOTE 4 ===")
for c in lote4_chunk:
    if c['sem_gabarito'] > 0:
        target_instituicoes.append(c['instituicao'])
        print(f"   • {c['instituicao'][:45].ljust(46)} | Total: {str(c['total_questoes']).rjust(3)} | Faltam: {str(c['sem_gabarito']).rjust(3)}")

# Checar matching com as ancoras
with open('data/checkpoints/ginecologia_gold_anchors_complete.json', 'r', encoding='utf-8') as f:
    anchors = json.load(f)
anchor_by_id = {item['id']: item for item in anchors if 'id' in item}

with open('data/ginecologia_final_questions.json', 'r', encoding='utf-8') as f:
    gineco = json.load(f)

target_set = set(target_instituicoes)
pending_in_gineco = [q for q in gineco if q.get('institution') in target_set and not (q.get('correct_answer') or '').strip()]
resolvable = sum(1 for q in pending_in_gineco if q.get('id') in anchor_by_id and anchor_by_id[q.get('id')].get('official_answer'))

print("\n" + "=" * 80)
print(f"Total de questões pendentes no escopo: {len(pending_in_gineco)}")
print(f"Total resolvíveis pelas âncoras de ouro: {resolvable} ({resolvable/len(pending_in_gineco)*100 if pending_in_gineco else 0:.1f}%)")
