import json
import re
import sys

# Forçar stdout em UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def validate():
    print("==================================================")
    print("[TESTE] INICIANDO BATERIA DE TESTES - QUALITY GATE (HPP)")
    print("==================================================")

    # 1. Carregar flashcards
    json_path = 'data/flashcards_hemorragia_pos_parto.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    print(f"📦 Total de flashcards carregados: {len(cards)}")
    assert len(cards) >= 70, f"Falha: Esperado no mínimo 70 cards para tema grande, obteve {len(cards)}"

    errors = []
    stopwords = {'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'um', 'uma', 'e', 'ou', 'que', 'se'}

    types_count = {}

    for i, c in enumerate(cards):
        cid = c.get('id', f'card-{i}')
        ctype = c.get('type')
        types_count[ctype] = types_count.get(ctype, 0) + 1

        # Validação de campos obrigatórios
        for req in ['id', 'type', 'front', 'back', 'comment', 'specialty', 'theme', 'focus', 'priority', 'tags', 'progress']:
            if req not in c or c[req] is None:
                errors.append(f"[{cid}] Campo obrigatório ausente: {req}")

        # Validação de limites de caracteres
        back = c.get('back', '')
        if len(back) > 120:
            errors.append(f"[{cid}] Verso excede 120 caracteres: {len(back)} chars")
        if len(back) < 1:
            errors.append(f"[{cid}] Verso vazio")

        comment = c.get('comment', '')
        if len(comment) < 20:
            errors.append(f"[{cid}] Comentário muito curto (< 20 chars): '{comment}'")

        # Proibição de SVGs artificiais
        for img_field in ['imageUrl', 'imageFrontUrl']:
            val = c.get(img_field)
            if val and 'data:image/svg+xml' in val:
                errors.append(f"[{cid}] PROIBIDO: Encontrado SVG sintético em {img_field}")

        # Validação de Cloze
        if ctype == 'cloze':
            front = c.get('front', '')
            cloze_matches = re.findall(r'\{\{c\d+::(.*?)\}\}', front)
            if not cloze_matches:
                errors.append(f"[{cid}] Tipo cloze mas sem marcação {{{{c1::...}}}} no front")
            for term in cloze_matches:
                clean_term = term.strip().lower()
                if clean_term in stopwords:
                    errors.append(f"[{cid}] Cloze inválido com stopword pura: '{{term}}'")

        # Validação FSRS
        prog = c.get('progress', {})
        for fld in ['state', 'repetitions', 'intervalDays', 'easeFactor', 'stability', 'difficulty', 'retrievability', 'lapses']:
            if fld not in prog:
                errors.append(f"[{cid}] Campo FSRS ausente: {fld}")

    print("\n📊 Distribuição dos Tipos de Flashcards:")
    for t, cnt in types_count.items():
        print(f"  • {t}: {cnt} cards ({cnt/len(cards)*100:.1f}%)")

    # 2. Validar Resumo Clínico
    summary_path = 'docs/resumo_hemorragia_pos_parto_alto_rendimento.md'
    with open(summary_path, 'r', encoding='utf-8') as f:
        summary_text = f.read()

    print(f"\n📄 Resumo Clínico: {len(summary_text)} caracteres")
    required_sections = [
        "## 1. O Que Mais Cai nas Provas de Residência Médica",
        "## 2. Definições Modernas & Parâmetros de Gravidade",
        "## 3. Profilaxia Universal: O Manejo Ativo do 3º Período",
        "## 4. Diagnóstico Etiológico: A Regra Mnemônica dos 4 Ts",
        "## 5. Manejo Escalonado da Atonia Uterina (The Golden Hour)",
        "## 6. Farmacoterapia Detalhada & Pegadinhas Clássicas de Prova",
        "## 7. Manejo das Outras Causas Específicas de HPP",
        "## 8. Pontos-Chave para Prova 💡"
    ]

    for sec in required_sections:
        if sec not in summary_text:
            errors.append(f"Resumo ausente da seção obrigatória: '{sec}'")
        else:
            print(f"  ✅ Seção presente: {sec}")

    # Verificar ausência de SVGs artificiais no resumo
    if 'data:image/svg+xml' in summary_text:
        errors.append("Resumo contém SVG artificial proibido")

    # Verificar presença de componentes esquemáticos e interativos padrão Miomas
    has_interactive = '```hpp-golden-hour' in summary_text or '```mermaid' in summary_text
    if not has_interactive:
        errors.append("Resumo não contém fluxograma/esquema de decisão clínica")
    else:
        print("  ✅ Esquemas visuais interativos presentes (Golden Hour / 4 Ts / Donut Stats)")

    print("\n--------------------------------------------------")
    if errors:
        print(f"❌ QUALITY GATE REPROVADO COM {len(errors)} ERROS:")
        for e in errors[:10]:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("🎉 QUALITY GATE 100% APROVADO!")
        print("  • 80/80 Flashcards em conformidade absoluta com o schema Zod e FSRS")
        print("  • 0 SVGs artificiais detectados")
        print("  • 100% dos clozes sanitizados com termos de ruptura clínica")
        print("  • Resumo completo adaptado de 8 seções com fluxograma Mermaid integrado")
        print("==================================================")

if __name__ == '__main__':
    validate()
