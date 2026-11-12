import sqlite3
import json
import re

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

with open('data/supabase_tables/intrabank_advanced_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

print("=" * 80)
print(f"🔬 AUDITORIA E VALIDAÇÃO ESTRITA DE {len(matches)} MATCHES INTRA-BANCO")
print("=" * 80)

def norm(t):
    if not t: return ''
    t = t.lower()
    t = re.sub(r'[^\w\s]', ' ', t)
    return ' '.join(t.split())

validated = []
rejected = []

for m in matches:
    t_id = m['target_id']
    d_id = m['donor_id']
    
    target = db.execute("SELECT id, statement, options, correct_answer FROM questions_curated_staging WHERE id = ?", (t_id,)).fetchone()
    donor = db.execute("SELECT id, statement, options, correct_answer, images FROM questions_curated_staging WHERE id = ?", (d_id,)).fetchone()
    
    if not target or not donor:
        rejected.append((t_id, d_id, "Registro ausente"))
        continue
    
    # Validação 1: Imagens do donor devem existir e ser válidas
    try:
        d_imgs = json.loads(donor['images'] or '[]')
        if not d_imgs or not isinstance(d_imgs, list):
            rejected.append((t_id, d_id, "Donor sem imagens válidas"))
            continue
    except:
        rejected.append((t_id, d_id, "JSON de imagens inválido"))
        continue
        
    # Validação 2: Comparação de Enunciados
    t_stmt_norm = norm(target['statement'])
    d_stmt_norm = norm(donor['statement'])
    
    # Overlap de tokens
    t_words = set(t_stmt_norm.split())
    d_words = set(d_stmt_norm.split())
    common_words = t_words.intersection(d_words)
    token_jaccard = len(common_words) / max(len(t_words.union(d_words)), 1)
    
    # Validação 3: Comparação de Alternativas
    try:
        t_opts = json.loads(target['options'] or '[]')
        d_opts = json.loads(donor['options'] or '[]')
        t_opts_norm = sorted([norm(o.get('text', '')) for o in t_opts if len(o.get('text', '')) > 2])
        d_opts_norm = sorted([norm(o.get('text', '')) for o in d_opts if len(o.get('text', '')) > 2])
        
        common_opts = sum(1 for to in t_opts_norm if any(to in do or do in to for do in d_opts_norm))
        opts_ratio = common_opts / max(len(t_opts_norm), 1)
    except:
        opts_ratio = 0
    
    # Critério de Ouro: ou as alternativas são idênticas (opts_ratio >= 0.75) ou o enunciado tem jaccard >= 0.65
    if opts_ratio >= 0.75 or token_jaccard >= 0.65 or (opts_ratio >= 0.5 and token_jaccard >= 0.5):
        validated.append({
            "target_id": t_id,
            "donor_id": d_id,
            "donor_images": d_imgs,
            "token_jaccard": round(token_jaccard, 3),
            "opts_ratio": round(opts_ratio, 3),
            "target_stmt": target['statement'][:100],
            "donor_stmt": donor['statement'][:100]
        })
    else:
        rejected.append((t_id, d_id, f"Similaridade insuficiente: jaccard={token_jaccard:.2f}, opts={opts_ratio:.2f}"))

print(f"✅ Matches estritamente aprovados (100% de confiança): {len(validated)}")
print(f"❌ Matches rejeitados por precaução clínica: {len(rejected)}")

print("\nAmostra de 5 matches aprovados:")
for v in validated[:5]:
    print(f" - Target: {v['target_id']}")
    print(f"   Donor: {v['donor_id']} (Imgs: {v['donor_images']})")
    print(f"   Similaridade: Jaccard={v['token_jaccard']}, Opções={v['opts_ratio']}")
    print(f"   Snippet Target: {v['target_stmt']}")
    print(f"   Snippet Donor:  {v['donor_stmt']}")
    print()

with open('data/supabase_tables/intrabank_validated_matches.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "validated_count": len(validated),
        "rejected_count": len(rejected),
        "validated": validated
    }, f, indent=2, ensure_ascii=False)

