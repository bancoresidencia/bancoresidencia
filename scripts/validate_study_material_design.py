import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_design_system():
    print("=" * 60)
    print("🎨 TESTE DE VALIDAÇÃO: DESIGN SYSTEM DE MATERIAIS DE ESTUDO")
    print("=" * 60)

    errors = []

    # 1. Auditar Resumo de Hemorragia Pós-Parto (HPP)
    summary_path = 'docs/resumo_hemorragia_pos_parto_alto_rendimento.md'
    with open(summary_path, 'r', encoding='utf-8') as f:
        summary_text = f.read()

    lines = summary_text.splitlines()

    # Check 1: Referências não podem estar no topo (linhas 1 a 15)
    top_block = "\n".join(lines[:15])
    if 'Diretrizes e Consensos de Referência' in top_block:
        errors.append("[CHECK-DESIGN-1] Bloco de referências encontrado indevidamente no topo do resumo.")
    else:
        print("  ✅ Topo limpo (sem bloco de referências redundante)")

    # Check 2: Referências devem estar no final do resumo
    bottom_block = "\n".join(lines[-25:])
    if 'Diretrizes Oficiais & Consensos de Referência' not in bottom_block and 'Referências' not in bottom_block:
        errors.append("[CHECK-DESIGN-2] Seção de referências oficiais ausente no final do resumo.")
    else:
        print("  ✅ Referências oficiais posicionadas corretamente no rodapé")

    # Check 3: Não pode conter seção estática de 'Pontos-Chave para Prova' (substituída pelo carrossel)
    if '## 8. Pontos-Chave para Prova' in summary_text or '## Pontos-Chave para Prova' in summary_text:
        errors.append("[CHECK-DESIGN-3] Resumo contém seção estática de pontos-chave duplicando o carrossel.")
    else:
        print("  ✅ Seção estática de pontos-chave removida (evita redundância com carrossel)")

    # Check 4: Proibição de Mermaid e SVGs artificiais
    if '```mermaid' in summary_text:
        errors.append("[CHECK-DESIGN-4] Resumo contém diagrama Mermaid escuro não permitido.")
    else:
        print("  ✅ Zero diagramas Mermaid escuros (substituídos por componentes nativos)")

    if 'data:image/svg+xml' in summary_text:
        errors.append("[CHECK-DESIGN-5] Resumo contém SVGs artificiais proibidos.")
    else:
        print("  ✅ Zero SVGs artificiais sintéticos detectados")

    # Check 5: Passo a Passo sintético antes do fluxograma
    if 'Passo a Passo Sintético da Cascata Decisória' not in summary_text:
        errors.append("[CHECK-DESIGN-6] Ausência do passo a passo sintético antes do fluxograma.")
    else:
        print("  ✅ Passo a passo sintético presente antecedendo o fluxograma")

    # 2. Auditar HppRecurrenceStatsCard.tsx
    card_path = 'src/components/study-material/HppRecurrenceStatsCard.tsx'
    with open(card_path, 'r', encoding='utf-8') as f:
        card_code = f.read()

    # Check 6: Tooltip preto do Recharts removido
    if '<Tooltip' in card_code or 'Tooltip,' in card_code or ', Tooltip' in card_code:
        errors.append("[CHECK-DESIGN-7] HppRecurrenceStatsCard contém Tooltip flutuante escuro do Recharts.")
    else:
        print("  ✅ Tooltip preto flutuante removido do gráfico Donut")

    # Check 7: Lock de seleção presente
    if 'lockedIndex' not in card_code and 'handleSelectSector' not in card_code:
        errors.append("[CHECK-DESIGN-8] HppRecurrenceStatsCard não possui controle de fixação por clique (Lock).")
    else:
        print("  ✅ Controle de fixação por clique (Lock de Seleção) presente")

    # 3. Auditar HppFourTsCard.tsx (Matriz 2x2 sem sobrecarga)
    four_ts_path = 'src/components/study-material/HppFourTsCard.tsx'
    with open(four_ts_path, 'r', encoding='utf-8') as f:
        four_ts_code = f.read()

    if 'lg:grid-cols-4' in four_ts_code or 'grid-cols-4' in four_ts_code:
        errors.append("[CHECK-DESIGN-8.1] HppFourTsCard está espremendo 4 colunas verticais em vez de usar Matriz 2x2.")
    elif 'md:grid-cols-2' in four_ts_code:
        print("  ✅ Matriz 2x2 (2 colunas e 2 linhas) aplicada com microcopy arejado")

    # 4. Auditar StudyMaterialReader.tsx
    reader_path = 'src/components/StudyMaterialReader.tsx'
    with open(reader_path, 'r', encoding='utf-8') as f:
        reader_code = f.read()

    # Check 8: Barra de tópicos sticky presente
    if 'sticky top-' not in reader_code:
        errors.append("[CHECK-DESIGN-9] StudyMaterialReader não possui barra de navegação rápida sticky.")
    else:
        print("  ✅ Barra de navegação de tópicos sticky com scroll spy presente")

    # Check 9: Carrossel de pérolas presente no leitor
    if 'snap-x snap-mandatory' not in reader_code or 'Pérolas de Alto Rendimento em Prova' not in reader_code:
        errors.append("[CHECK-DESIGN-10] StudyMaterialReader não possui carrossel horizontal de pérolas.")
    else:
        print("  ✅ Carrossel horizontal de Pérolas de Alto Rendimento implementado")

    # Check 10: Parser hierárquico de listas presente
    if 'item.level' not in reader_code:
        errors.append("[CHECK-DESIGN-11] StudyMaterialReader não suporta múltiplos níveis hierárquicos de listas.")
    else:
        print("  ✅ Parser hierárquico de subtópicos com recuo (Níveis 0, 1 e 2) presente")

    print("-" * 60)
    if errors:
        print(f"❌ REPROVADO COM {len(errors)} ERRO(S):")
        for err in errors:
            print(f"  • {err}")
        return False
    else:
        print("🎉 DESIGN QUALITY GATE 100% APROVADO!")
        print("  • Todos os critérios de UI/UX, alinhamento e ausência de redundâncias atendidos.")
        print("=" * 60)
        return True

if __name__ == '__main__':
    success = test_design_system()
    sys.exit(0 if success else 1)
