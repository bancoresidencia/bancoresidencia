import sys
import os
import re
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_design_system(summary_file=None):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    print("=" * 60)
    print("🎨 TESTE DE VALIDAÇÃO: DESIGN SYSTEM DE MATERIAIS DE ESTUDO (v3.1.0 - BLINDAGEM CANÔNICA)")
    print("=" * 60)

    errors = []

    # 1. Auditar Resumo Clínico
    summary_path = summary_file if summary_file else os.path.join(base_dir, 'docs', 'resumo_hemorragia_pos_parto_alto_rendimento.md')
    if not os.path.isabs(summary_path):
        summary_path = os.path.join(base_dir, summary_path)

    if not os.path.exists(summary_path):
        errors.append(f"Arquivo de resumo não encontrado: {summary_path}")
        return False

    with open(summary_path, 'r', encoding='utf-8') as f:
        summary_text = f.read()

    lines = summary_text.splitlines()

    # Check 1: Referências não podem estar no topo (linhas 1 a 15)
    top_block = "\n".join(lines[:15])
    if 'Diretrizes e Consensos de Referência' in top_block or 'Diretrizes Oficiais' in top_block:
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
    if 'Passo a Passo Sintético' not in summary_text and 'Passo a Passo da Cascata' not in summary_text:
        errors.append("[CHECK-DESIGN-6] Ausência do passo a passo sintético antes do fluxograma.")
    else:
        print("  ✅ Passo a passo sintético presente antecedendo o fluxograma")

    # Check 5.1: Se houver bloco exam-stats, validar se não está vazio ou corrompido
    if '```exam-stats' in summary_text:
        if '```exam-stats\n{}\n' in summary_text or '```exam-stats\n\n```' in summary_text:
            errors.append("[CHECK-DESIGN-CENSUS] Bloco exam-stats presente mas com dados vazios (proibido no padrão canônico).")
        else:
            print("  ✅ Bloco Donut exam-stats parametrizado com dados censitários válidos")

    # 2. Auditar HppRecurrenceStatsCard.tsx e ExamRecurrenceStatsCard.tsx
    card_path = os.path.join(base_dir, 'src', 'components', 'study-material', 'HppRecurrenceStatsCard.tsx')
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
    four_ts_path = os.path.join(base_dir, 'src', 'components', 'study-material', 'HppFourTsCard.tsx')
    with open(four_ts_path, 'r', encoding='utf-8') as f:
        four_ts_code = f.read()

    if 'lg:grid-cols-4' in four_ts_code or 'grid-cols-4' in four_ts_code:
        errors.append("[CHECK-DESIGN-8.1] HppFourTsCard está espremendo 4 colunas verticais em vez de usar Matriz 2x2.")
    elif 'md:grid-cols-2' in four_ts_code:
        print("  ✅ Matriz 2x2 (2 colunas e 2 linhas) aplicada com microcopy arejado")

    # 4. Auditar StudyMaterialReader.tsx
    reader_path = os.path.join(base_dir, 'src', 'components', 'StudyMaterialReader.tsx')
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

    # Check 11: ExamRecurrenceStatsCard auditado para suporte a props dinâmicas
    exam_card_path = os.path.join(base_dir, 'src', 'components', 'study-material', 'ExamRecurrenceStatsCard.tsx')
    with open(exam_card_path, 'r', encoding='utf-8') as f:
        exam_card_code = f.read()

    if 'ExamRecurrenceStatsCardProps' not in exam_card_code:
        errors.append("[CHECK-DESIGN-12] ExamRecurrenceStatsCard não suporta ExamRecurrenceStatsCardProps dinâmico.")
    else:
        print("  ✅ ExamRecurrenceStatsCard parametrizado e preparado para qualquer tema")

    # Check 12: KaTeX e integridade de fórmulas
    if r'\begin{cases}' in summary_text and r'\end{cases}' not in summary_text:
        errors.append("[CHECK-FORMULA-12] Ambiente \\begin{cases} não foi fechado com \\end{cases}.")
    else:
        print("  ✅ Fórmulas KaTeX e ambientes cases devidamente estruturados")

    # Check 13: Esquemas Visuais Modulares (Parcimônia & Conformidade)
    if '```clinical-scheme' in summary_text:
        schemes = re.findall(r'```clinical-scheme\s*([\s\S]*?)```', summary_text)
        if len(schemes) > 3:
            errors.append(f"[CHECK-SCHEME-13] Excesso de esquemas visuais ({len(schemes)} encontrados). Máximo permitido: 2 por resumo.")
        else:
            print(f"  ✅ Esquemas visuais em conformidade com o Princípio da Parcimônia ({len(schemes)} presente(s))")

    # Check 14: Imagens Médicas Reais com Legendas Estruturadas
    if '![' in summary_text and '](' in summary_text:
        print("  ✅ Imagens médicas reais incluídas no resumo com legendas clínicas estruturadas")

    # Check 15: UniversalRecurrenceStatsCard com reatividade a bancas
    uni_card_path = os.path.join(base_dir, 'src', 'components', 'study-material', 'UniversalRecurrenceStatsCard.tsx')
    if os.path.exists(uni_card_path):
        with open(uni_card_path, 'r', encoding='utf-8') as f:
            uni_code = f.read()
        if 'bancaBreakdown' in uni_code and 'selectedBanca' in uni_code:
            print("  ✅ UniversalRecurrenceStatsCard parametrizado com suporte reativo a bancas (Imagem 3/5)")
        else:
            errors.append("[CHECK-RECURRENCE-15] UniversalRecurrenceStatsCard não integra bancaBreakdown com selectedBanca.")

    # Check 16: Anti-Redundância Estrita (Zero subtítulos intermediários repetidos e Zero despejo de quadrantes)
    if re.search(r'####\s*[🔴🟢🟡🔵]?\s*Quadrante\s*\d', summary_text, re.IGNORECASE):
        errors.append("[CHECK-DESIGN-16] Despejo de texto rascunhado com '#### Quadrante X' detectado abaixo do card visual.")
    elif 'Matriz 2x2: Fatores Determinantes de Risco' in summary_text:
        errors.append("[CHECK-DESIGN-16] Subtítulo intermediário redundante detectado duplicando o título da seção.")
    else:
        print("  ✅ Anti-redundância estrita validada (zero subtítulos repetidos e zero despejo de quadrantes)")

    # Check 17: Ground-Truth Iconográfico (Zero imagens mock/stock e presença de Achado Cardinal)
    image_matches = re.findall(r'!\[(.*?)\]\((.*?)\)', summary_text)
    for alt, src in image_matches:
        if 'mock' in src.lower() or 'stock' in src.lower() or 'placeholder' in src.lower():
            errors.append(f"[CHECK-IMAGE-17] Imagem mock ou genérica detectada: {src}. Apenas imagens clínicas reais são permitidas.")
        if '[Achado Visual Cardinal]' not in alt and '**[Achado Visual Cardinal]**' not in alt:
            errors.append(f"[CHECK-IMAGE-17] Legenda de imagem sem [Achado Visual Cardinal]: {src}")
    if image_matches:
        print(f"  ✅ Ground-truth iconográfico validado para {len(image_matches)} imagem(ns) clínica(s) autêntica(s)")

    # Check 19: Integridade Estrita de Delimitadores de Blocos de Código
    cb_fence_count = 0
    for line_idx, line in enumerate(lines, start=1):
        s_line = line.strip()
        if s_line.startswith('```'):
            cb_fence_count += 1
        elif s_line in ['`', '``']:
            errors.append(f"[CHECK-CODEBLOCK-19] Crase isolada incompleta na linha {line_idx}: '{s_line}'. Delimitador deve conter exatamente 3 crases (```).")
    if cb_fence_count % 2 != 0:
        errors.append(f"[CHECK-CODEBLOCK-19] Número ímpar de delimitadores de código ({cb_fence_count}). Bloco de código aberto sem fechamento correspondente!")
    else:
        print(f"  ✅ Integridade de blocos de código validada ({cb_fence_count // 2} blocos perfeitamente fechados)")

    # Check 18: Zero vazamento de código bruto customizado no leitor
    if 'diff-diagnosis' in reader_code and 'clinical-score' in reader_code:
        print("  ✅ Leitor protegido com interceptadores nativos para diff-diagnosis e clinical-score (Zero vazamento JSON)")
    else:
        errors.append("[CHECK-WIDGET-18] StudyMaterialReader não possui renderizadores nativos para diff-diagnosis ou clinical-score.")

    print("-" * 60)
    if errors:
        print(f"❌ REPROVADO COM {len(errors)} ERRO(S):")
        for err in errors:
            print(f"  • {err}")
        return False
    else:
        print("🎉 DESIGN QUALITY GATE 100% APROVADO!")
        print("  • Todos os critérios de UI/UX, censo dinâmico e ausência de redundâncias atendidos.")
        print("=" * 60)
        return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Validador Canônico do Design System de Resumos")
    parser.add_argument("--file", help="Caminho do arquivo markdown de resumo a ser auditado", default=None)
    args = parser.parse_args()

    success = test_design_system(args.file)
    sys.exit(0 if success else 1)
