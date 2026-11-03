import sys
import os
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_gemelaridade_summaries():
    print("=" * 70)
    print("🎨 TESTE DE VALIDAÇÃO: 4 RESUMOS DE GESTAÇÃO MÚLTIPLA")
    print("=" * 70)

    summaries = [
        ('docs/resumo_gemelaridade_01.md', '1. Classificação e Corionicidade'),
        ('docs/resumo_gemelaridade_02.md', '2. Complicações Monocoriônicas'),
        ('docs/resumo_gemelaridade_03.md', '3. Síndrome da Transfusão Feto-Fetal'),
        ('docs/resumo_gemelaridade_04.md', '4. Assistência ao Parto')
    ]

    total_errors = []

    for file_path, name in summaries:
        print(f"\n🩺 Auditando: {name} ({file_path})")
        if not os.path.exists(file_path):
            total_errors.append(f"Arquivo {file_path} não encontrado.")
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.splitlines()

        # Check 1: Sem H1 e sem referências no topo
        top_15 = "\n".join(lines[:15])
        if top_15.startswith('# ') or '\n# ' in top_15:
            total_errors.append(f"[{name}] Título H1 redundante encontrado no topo.")
        else:
            print("  ✅ Topo limpo (sem H1 duplicado)")

        if 'Diretrizes Oficiais' in top_15 or 'Referências' in top_15:
            total_errors.append(f"[{name}] Bloco de referências indevidamente no topo.")

        # Check 2: Referências oficiais no rodapé
        bottom_30 = "\n".join(lines[-30:])
        if 'Diretrizes Oficiais' not in bottom_30 and 'Referências' not in bottom_30:
            total_errors.append(f"[{name}] Seção de Diretrizes Oficiais ausente no rodapé.")
        else:
            print("  ✅ Referências oficiais presentes no rodapé")

        # Check 3: Sem seção estática de pontos-chave
        if re.search(r'##\s*(\d+\.)?\s*Pontos-Chave', content, re.IGNORECASE):
            total_errors.append(f"[{name}] Seção estática de pontos-chave duplicando o carrossel.")
        else:
            print("  ✅ Sem duplicação de pontos-chave estáticos (delegado ao carrossel)")

        # Check 4: Zero Mermaid e zero SVGs
        if '```mermaid' in content:
            total_errors.append(f"[{name}] Diagrama Mermaid escuro encontrado.")
        else:
            print("  ✅ Zero diagramas Mermaid escuros")

        if 'data:image/svg+xml' in content:
            total_errors.append(f"[{name}] SVG artificial encontrado.")
        else:
            print("  ✅ Zero SVGs artificiais")

        # Check 5: Passo a passo sintético
        if 'Passo a Passo Sintético' not in content:
            total_errors.append(f"[{name}] Ausência do subtítulo 'Passo a Passo Sintético da Cascata Decisória'.")
        else:
            print("  ✅ Passo a passo sintético da cascata decisória presente")

        # Check 6: Token de estatísticas presente
        if not re.search(r'```gem-stats-', content):
            total_errors.append(f"[{name}] Token de estatísticas gem-stats-* ausente.")
        else:
            print("  ✅ Token Recharts de estatísticas do censo presente")

        # Check 7: Armadilha clássica de prova
        if '[!WARNING]' not in content:
            total_errors.append(f"[{name}] Caixa de aviso de armadilha clássica [!WARNING] ausente.")
        else:
            print("  ✅ Caixa de armadilha clássica de prova presente")

        # Check 8: Fórmulas matemáticas ou notações
        if '$$' not in content:
            total_errors.append(f"[{name}] Fórmulas clínicas KaTeX ($$) ausentes.")
        else:
            print("  ✅ Notação matemática/KaTeX centralizada presente")

    # 2. Auditar componente GemelaridadeRecurrenceStatsCard.tsx
    card_path = 'src/components/study-material/GemelaridadeRecurrenceStatsCard.tsx'
    print(f"\n📊 Auditando Componente Recharts ({card_path}):")
    with open(card_path, 'r', encoding='utf-8') as f:
        card_code = f.read()

    if '<Tooltip' in card_code or 'Tooltip,' in card_code or ', Tooltip' in card_code:
        total_errors.append("GemelaridadeRecurrenceStatsCard contém Tooltip escuro do Recharts.")
    else:
        print("  ✅ Tooltip preto flutuante ausente do Donut")

    if 'lockedIndex' not in card_code:
        total_errors.append("GemelaridadeRecurrenceStatsCard não possui controle de fixação por clique (Lock).")
    else:
        print("  ✅ Controle de fixação por clique (Lock de Seleção) presente")

    print("\n" + "-" * 70)
    if total_errors:
        print(f"❌ REPROVADO COM {len(total_errors)} ERRO(S):")
        for err in total_errors:
            print(f"  • {err}")
        return False
    else:
        print("🎉 TODOS OS 4 RESUMOS E COMPONENTES APROVADOS COM 100% DE SUCESSO!")
        print("=" * 70)
        return True

if __name__ == '__main__':
    ok = test_gemelaridade_summaries()
    sys.exit(0 if ok else 1)

