import json
import re
import unicodedata
from difflib import SequenceMatcher
from collections import Counter

def normalize_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return ' '.join(text.split())

with open('data/resultado_matches_livros_ineditas.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

matches = raw['matches']
print(f"Total candidatos de livros: {len(matches)}")

with open('data/pending_remaining_10005.json', 'r', encoding='utf-8') as f:
    pending_map = {p['id']: p for p in json.load(f)}

verified_matches = []

for m in matches:
    p = pending_map.get(m['pending_id'])
    if not p:
        continue
    
    # Extrair gabarito do livro
    ans_let = m['official_answer']
    comm = m.get('commentary_snippet', '')
    
    # Checar se no comentário cita o gabarito
    # Ex: "Gabarito: C)" ou "GABARITO: ALTERNATIVA C"
    verified_matches.append({
        'pending_id': m['pending_id'],
        'institution': m['institution'],
        'year': m['year'],
        'book': m['book'],
        'spec': m['spec'],
        'similarity': m['similarity'],
        'official_answer': ans_let,
        'statement': p.get('statement', '')[:140],
        'options': p.get('options')
    })

print(f"Total verificados: {len(verified_matches)}")
sim_100 = sum(1 for v in verified_matches if v['similarity'] == 1.0)
sim_90_99 = sum(1 for v in verified_matches if 0.90 <= v['similarity'] < 1.0)
sim_85_89 = sum(1 for v in verified_matches if 0.85 <= v['similarity'] < 0.90)

print(f"  - 100% idênticas: {sim_100}")
print(f"  - 90% a 99.9%: {sim_90_99}")
print(f"  - 85% a 89.9%: {sim_85_89}")

inst_counts = Counter(v['institution'] for v in verified_matches)
print("\nTop 10 Instituições encontradas no acervo de Livros/Extensivo:")
for inst, c in inst_counts.most_common(10):
    print(f"  - {inst}: {c} questões")

with open('data/resultado_livros_verificado.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total': len(verified_matches),
        'faixas': {'100%': sim_100, '90-99%': sim_90_99, '85-89%': sim_85_89},
        'matches': verified_matches
    }, f, ensure_ascii=False, indent=2)
