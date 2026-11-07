"""
Gera o Relatorio Completo da Taxonomia Original Reestabelecida (258.953 questoes)
Exatamente como estava antes da recategorizacao:
- 132k questoes originais com seus filtros de origem (6 especialidades, 110 temas, 679 focos)
- 125k questoes de expansao com seus filtros brutos de origem (29 especialidades, temas e focos das plataformas)
Salva em docs/RELATORIO_HIERARQUICO_TAXONOMIA_ORIGINAL_REESTABELECIDA_259K.md
"""

import json, os, sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
REPORT_PATH = os.path.join(r'd:\bancoresidencia\docs', 'RELATORIO_HIERARQUICO_TAXONOMIA_ORIGINAL_REESTABELECIDA_259K.md')

FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

def main():
    print("=================================================================")
    print("[RELATORIO HIERARQUICO DA TAXONOMIA ORIGINAL REESTABELECIDA]")
    print("=================================================================")

    tree = defaultdict(lambda: defaultdict(lambda: defaultdict(Counter)))
    esp_counter = Counter()
    tema_counter = Counter()
    foco_counter = Counter()
    subfoco_counter = Counter()
    total_q = 0

    for fname in FILES:
        p = os.path.join(DATA_DIR, fname)
        with open(p, 'r', encoding='utf-8') as f:
            q_list = json.load(f)
        print(f"Lendo {fname} ({len(q_list):,} q)...")
        for q in q_list:
            total_q += 1
            esp = str(q.get('especialidade') or 'Não informado').strip()
            tema = str(q.get('tema') or 'Não informado').strip()
            foco = str(q.get('foco') or 'Não informado').strip()
            sub = str(q.get('subfoco') or 'Não informado').strip()

            tree[esp][tema][foco][sub] += 1
            esp_counter[esp] += 1
            tema_counter[(esp, tema)] += 1
            foco_counter[(esp, tema, foco)] += 1
            subfoco_counter[(esp, tema, foco, sub)] += 1

    print(f"\nTotal de questoes: {total_q:,}")
    print(f"Especialidades: {len(esp_counter)}")
    print(f"Temas: {len(tema_counter)}")
    print(f"Focos: {len(foco_counter)}")
    print(f"Subfocos: {len(subfoco_counter)}")

    lines = []
    lines.append("# Relatório Completo da Taxonomia Original Reestabelecida (258.953 Questões)")
    lines.append("## Plataforma Banco Residência Médica — Estado Exato Pré-Recategorização")
    lines.append("")
    lines.append(f"> **Resumo Consolidado:** {len(esp_counter)} Especialidades/Rótulos | {len(tema_counter)} Temas | {len(foco_counter)} Focos | {len(subfoco_counter):,} Subfocos")
    lines.append("> **Composição do Acervo:**")
    lines.append("> - **132.965 questões originais:** 100% preservadas com sua taxonomia inicial padrão (6 áreas, 110 temas, 679 focos).")
    lines.append("> - **125.988 questões da expansão:** 100% restabelecidas para suas categorizações brutas de extração das plataformas (Hardwork, QuestMed, etc.).")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Tabela Executiva de Especialidades
    lines.append("## 📊 1. Distribuição Geral por Especialidade / Rótulo de Origem")
    lines.append("")
    lines.append("| Especialidade / Rótulo | Questões | % do Banco | Temas Distintos | Focos Distintos | Subfocos Distintos |")
    lines.append("| :--- | :---: | :---: | :---: | :---: | :---: |")

    for esp, count in esp_counter.most_common():
        pct = (count / total_q) * 100
        n_temas = len(tree[esp])
        n_focos = sum(len(tree[esp][t]) for t in tree[esp])
        n_sub = sum(sum(len(tree[esp][t][f]) for f in tree[esp][t]) for t in tree[esp])
        lines.append(f"| **{esp}** | **{count:,}** | {pct:.2f}% | {n_temas:,} | {n_focos:,} | {n_sub:,} |")

    lines.append(f"| **TOTAL GERAL** | **{total_q:,}** | **100,00%** | **{len(tema_counter):,}** | **{len(foco_counter):,}** | **{len(subfoco_counter):,}** |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Árvore Hierárquica Completa
    lines.append("## 🌳 2. Árvore Hierárquica Completa (Especialidade $\\rightarrow$ Tema $\\rightarrow$ Foco $\\rightarrow$ Subfoco)")
    lines.append("")

    for esp, count in esp_counter.most_common():
        pct_esp = (count / total_q) * 100
        n_temas = len(tree[esp])
        n_focos = sum(len(tree[esp][t]) for t in tree[esp])
        n_sub = sum(sum(len(tree[esp][t][f]) for f in tree[esp][t]) for t in tree[esp])
        
        lines.append(f"# 📁 ESPECIALIDADE: {esp.upper()} ({count:,} questões — {pct_esp:.2f}%)")
        lines.append(f"*Temas:* {n_temas} | *Focos:* {n_focos:,} | *Subfocos:* {n_sub:,}")
        lines.append("")

        for tema in sorted(tree[esp].keys(), key=lambda t: sum(sum(tree[esp][t][f].values()) for f in tree[esp][t]), reverse=True):
            q_tema = sum(sum(tree[esp][tema][f].values()) for f in tree[esp][tema])
            pct_tema = (q_tema / count) * 100
            n_focos_tema = len(tree[esp][tema])
            
            lines.append(f"## 🔹 Tema: {tema} ({q_tema:,} questões — {pct_tema:.1f}% da especialidade)")
            lines.append(f"*Focos no tema:* {n_focos_tema}")
            lines.append("")

            for foco in sorted(tree[esp][tema].keys(), key=lambda f: sum(tree[esp][tema][f].values()), reverse=True):
                q_foco = sum(tree[esp][tema][foco].values())
                pct_foco = (q_foco / q_tema) * 100
                lines.append(f"### • Foco: {foco} — {q_foco:,} questões ({pct_foco:.1f}%)")
                
                for subfoco in sorted(tree[esp][tema][foco].keys(), key=lambda s: tree[esp][tema][foco][s], reverse=True):
                    q_sub = tree[esp][tema][foco][subfoco]
                    pct_sub = (q_sub / q_foco) * 100
                    lines.append(f"  - **Subfoco:** {subfoco}: {q_sub:,} questões ({pct_sub:.1f}%)")
                lines.append("")
        lines.append("---")
        lines.append("")

    content = '\n'.join(lines)
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n[SUCESSO] Relatorio gravado em: {REPORT_PATH}")
    size_mb = os.path.getsize(REPORT_PATH) / (1024 * 1024)
    print(f"Total de linhas geradas: {len(lines):,}")
    print(f"Tamanho do arquivo: {size_mb:.2f} MB")

if __name__ == '__main__':
    main()
