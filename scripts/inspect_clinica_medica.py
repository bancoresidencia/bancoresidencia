import sqlite3
import json

# 1. Carregar clinicaMedicaData.ts
with open('src/data/clinicaMedicaData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

eq_idx = content.find('= {')
json_str = content[eq_idx + 2 : content.rfind('}') + 1]
data = json.loads(json_str)

print("=" * 70)
print(f"ANÁLISE DE ESTRUTURA: CLÍNICA MÉDICA ({len(data['temas'])} Temas no Front-End)")
print("=" * 70)

# 2. Conectar no SQLite
conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM questions WHERE especialidade = 'Clínica Médica'")
total_clinica = cur.fetchone()[0]
print(f"Total de questões de Clínica Médica no Banco: {total_clinica}\n")

# Analisar cada Tema no front-end e no banco
for i, tema in enumerate(data['temas'], 1):
    tema_nome = tema['tema']
    focos = tema.get('focos', [])
    total_subfocos = sum(len(f.get('subfocos', [])) for f in focos)
    
    # Contagem no banco
    cur.execute("""
        SELECT COUNT(*) FROM questions 
        WHERE especialidade = 'Clínica Médica' 
          AND (tema = ? OR novo_tema = ? OR tema LIKE ? OR novo_tema LIKE ?)
    """, (tema_nome, tema_nome, f"%{tema_nome.split(' ')[0]}%", f"%{tema_nome.split(' ')[0]}%"))
    count_db = cur.fetchone()[0]
    
    print(f"{i:2d}. Tema: '{tema_nome}'")
    print(f"    -> {len(focos)} Focos | {total_subfocos} Subfocos | ~{count_db} questões no banco")
    
    # Checar anomalias de sub_subfocos acumulados
    for f in focos:
        for s in f.get('subfocos', []):
            if isinstance(s, dict) and len(s.get('sub_subfocos', [])) > 5:
                print(f"    [ANOMALIA] Foco '{f['foco']}' -> Subfoco '{s['subfoco']}' tem {len(s['sub_subfocos'])} itens acumulados!")
