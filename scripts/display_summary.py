import json

with open('scripts/deep_audit_results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tot = data['total_questions']
print(f"=== TOTAL QUESTOES: {tot:,} ===")

print("\n--- GABARITO SUMMARY ---")
for k, v in data['gabarito_summary'].items():
    print(f"  {k}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- CORRECT ANSWER DISTRIBUTION (TOP 15) ---")
for k, v in sorted(data['correct_answer_dist'].items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {repr(k)}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- TYPE DISTRIBUTION ---")
for k, v in data['type_distribution'].items():
    print(f"  {repr(k)}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- OPTIONS FORMAT COUNTER ---")
for k, v in data['options_format_counter'].items():
    print(f"  {k}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- OPTIONS LENGTH DISTRIBUTION ---")
for k, v in sorted(data['options_len_counter'].items(), key=lambda x: int(x[0])):
    print(f"  {k} alternativas: {v:,} ({v/tot*100:.2f}%)")

print("\n--- MISSING LETTER COUNTER ---")
for k, v in data['missing_letter_counter'].items():
    print(f"  {k}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- MISSING LETTER BY SOURCE ---")
for k, v in sorted(data['missing_letter_by_source'].items(), key=lambda x: x[1], reverse=True):
    print(f"  {k}: {v:,}")

print("\n--- MISSING LETTER WITH VALID GAB (A, B, C, D, E) ---")
tot_missing_let_valid_gab = sum(data['missing_letter_with_valid_gab'].values())
print(f"  Total sem letra mas com gabarito A-E: {tot_missing_let_valid_gab:,}")
for k, v in sorted(data['missing_letter_with_valid_gab'].items(), key=lambda x: x[1], reverse=True):
    print(f"    Gabarito {k}: {v:,}")

print("\n--- TYPE VS OPTIONS FORMAT ---")
for qtype, formats in data['type_vs_options'].items():
    print(f"  Type '{qtype}':")
    for fmt, count in formats.items():
        print(f"    {fmt}: {count:,}")

print("\n--- COMMENTARY STATS ---")
for k, v in data['commentary_stats'].items():
    print(f"  {k}: {v:,} ({v/tot*100:.2f}%)")

print("\n--- SAMPLE MISSING LETTERS (first 3) ---")
for item in data['sample_missing_letters'][:3]:
    print("  ID:", item['id'])
    print("  Code:", item['code'])
    print("  Source:", item['src'])
    print("  Keys in dict:", item['keys'])
    print("  Correct answer:", item['correct_answer'])
    print("  Options preview:", item['options_preview'])
    print("  " + "-" * 40)

print("\n--- SAMPLE TYPE MISMATCH (first 3) ---")
for item in data['sample_type_mismatch'][:3]:
    print(item)
