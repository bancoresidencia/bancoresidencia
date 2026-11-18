import json

with open('data/questoes_ineditas_livros_drive_7822.json', 'r', encoding='utf-8') as f:
    ineditas = json.load(f)

print(f"Total: {len(ineditas)}")
q0 = ineditas[0]
print("Keys:", list(q0.keys()))
print("\nHeader:", q0.get('header'))
print("\nStatement:", q0.get('statement')[:300])
print("\nOfficial Answer:", q0.get('official_answer'))
print("\nCommentary:", q0.get('commentary')[:200])

# Are the options embedded inside statement?
print("\n--- Check options in statement ---")
print(q0.get('statement')[-500:])
