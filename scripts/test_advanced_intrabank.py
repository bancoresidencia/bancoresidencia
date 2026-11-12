import sqlite3, json, re

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)['catalog']

# Donor questions: questions with images
donors = db.execute("SELECT id, year, banca, statement, options, images FROM questions_curated_staging WHERE images IS NOT NULL AND images != '[]' AND images != ''").fetchall()
print(f"Total donor questions with images: {len(donors)}")

def norm(t):
    if not t: return ''
    t = t.lower()
    t = re.sub(r'[^\w\s]', ' ', t)
    return ' '.join(t.split())

# Inverted index of 6-word shingles from donor statements
donor_shingles = {}
for d in donors:
    words = norm(d['statement']).split()
    for i in range(len(words) - 5):
        shingle = ' '.join(words[i:i+6])
        if len(shingle) > 25:
            if shingle not in donor_shingles:
                donor_shingles[shingle] = []
            donor_shingles[shingle].append(d)

print(f"Unique 6-word shingles indexed from donors: {len(donor_shingles)}")

# Also index donor by options text
donor_options = {}
for d in donors:
    try:
        opts = json.loads(d['options'] or '[]')
        joined_opts = ' '.join(norm(o.get('text', '')) for o in opts if len(o.get('text', '')) > 5)
        if len(joined_opts) > 20:
            donor_options[d['id']] = (joined_opts, d)
    except:
        pass

shingle_matches = []
for q in cat:
    row = db.execute("SELECT id, statement, options, year, banca FROM questions_curated_staging WHERE id = ?", (q['id'],)).fetchone()
    if not row or not row['statement']: continue
    words = norm(row['statement']).split()
    matched_donor = None
    for i in range(len(words) - 5):
        shingle = ' '.join(words[i:i+6])
        if shingle in donor_shingles:
            candidates = donor_shingles[shingle]
            for cand in candidates:
                cand_norm = norm(cand['statement'])
                overlap = sum(1 for w in words[:20] if w in cand_norm)
                if overlap >= 14:
                    # Verify options similarity or same year
                    matched_donor = cand
                    break
        if matched_donor: break
    
    if matched_donor:
        shingle_matches.append({
            "target_id": row['id'],
            "donor_id": matched_donor['id'],
            "donor_banca": matched_donor['banca'],
            "donor_year": matched_donor['year'],
            "donor_images": matched_donor['images']
        })

print(f"Advanced fuzzy intra-bank matches found: {len(shingle_matches)}")
for sm in shingle_matches[:10]:
    print(f"  Target: {sm['target_id']} -> Donor: {sm['donor_id']} ({sm['donor_banca']} {sm['donor_year']})")

with open('data/supabase_tables/intrabank_advanced_matches.json', 'w', encoding='utf-8') as f:
    json.dump(shingle_matches, f, indent=2, ensure_ascii=False)

