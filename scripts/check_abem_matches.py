import json
import re
import unicodedata
from difflib import SequenceMatcher

def normalize_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return ' '.join(text.split())

with open('data/abem_gabaritos_2024_2025_2026.json', 'r', encoding='utf-8') as f:
    abem = json.load(f)

with open('data/pending_remaining_10005.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

# Pegar apenas pendentes cuja instituição ou banca mencione ABEM ou ANASEM ou similar
abem_pending = [p for p in pending if any(k in (p.get('institution') or '').lower() or k in (p.get('banca') or '').lower() for k in ['abem', 'anasem', 'associacao brasileira de educacao medica'])]
print(f"Pendentes associados à ABEM: {len(abem_pending)}")

# Também checar se o texto de alguma opção da ABEM bate com as opções dos pendentes
abem_matches = []
for p in pending:
    # Checar se ano é 2024, 2025 ou 2026
    yr = str(p.get('year') or '')
    if yr in abem:
        # p['options']
        p_opts = p.get('options')
        if isinstance(p_opts, list):
            for item_num, item_data in abem[yr].items():
                target_text = normalize_text(item_data.get('opt_text', ''))
                if len(target_text) > 15:
                    for opt in p_opts:
                        if isinstance(opt, dict):
                            o_norm = normalize_text(opt.get('text', ''))
                            if target_text in o_norm or o_norm in target_text:
                                sim = SequenceMatcher(None, target_text, o_norm).ratio()
                                if sim >= 0.90:
                                    # Checar se enunciado tem correlação
                                    comm = normalize_text(item_data.get('commentary', ''))
                                    stmt = normalize_text(p.get('statement', ''))
                                    # Muitas vezes o comentário cita termos do enunciado
                                    abem_matches.append({
                                        'pending_id': p['id'],
                                        'institution': p.get('institution'),
                                        'year': p.get('year'),
                                        'abem_year': yr,
                                        'abem_num': item_num,
                                        'abem_letter': item_data.get('letter'),
                                        'target_opt': item_data.get('opt_text'),
                                        'matched_opt': opt.get('text'),
                                        'pending_statement': p.get('statement', '')[:120]
                                    })
                                    break

print(f"Total de potenciais matches ABEM: {len(abem_matches)}")
if abem_matches:
    print("Exemplo 1:", abem_matches[0])
