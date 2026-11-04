---
name: interactive-study-widgets
description: Engenheiro, calibrador e auditor de ferramentas interativas embutidas nos resumos clínicos da plataforma Banco Residência. Governa a reatividade do Raio-X de Recorrência com filtros dinâmicos de bancas, o carrossel de pontos-chave com navegação contínua, calculadoras clínicas e diagramas anatômicos.
---

# Interactive Study Widgets: Engenharia de Ferramentas Interativas nos Resumos

Este manual define a arquitetura, o comportamento reativo e o controle de qualidade para as **ferramentas ativas de estudo** embutidas nos materiais de leitura do **Banco Residência**.

---

## 🎯 1. Filosofia de Interatividade Médica

O resumo clínico canônico não é um PDF estático. Ele é uma **plataforma ativa de assimilação**. 
A interatividade serve a dois propósitos fundamentais:
1. **Exploração Dinâmica de Dados de Prova:** Permitir que o aluno analise como o tema se comporta nacionalmente vs. nas bancas que ele prestará (USP, ENARE, SUS-SP, AMRIGS).
2. **Engajamento Cinestésico:** Proporcionar ferramentas táteis (carrossel de fixação rápida, calculadoras de cabeceira, simuladores de escore) que quebram a leitura passiva.

---

## ⚙️ 2. As Ferramentas Interativas Canônicas

### A. Raio-X de Recorrência Reativo com Filtro de Bancas (UniversalRecurrenceStatsCard)
* **Estrutura Visual:**
  - **Lado Esquerdo:** Gráfico Donut (Recharts) com raio interno proporcional, percentual central em tipografia de destaque (`XX%`), legenda `"recorrência em provas"` e aviso de interação `"Passe o mouse ou toque nos setores do gráfico para detalhar"`.
  - **Lado Direito:** Lista com pontos coloridos, nomes dos subfocos, badges de prioridade (`Crítica`, `Alta`, `Média`), contagem explícita (`{q} questões`) e **barras de progresso horizontais animadas** (`w-full h-1.5 rounded-full`) na cor do subfoco.
  - **Box Inferior Dinâmico:** Card destacado com índice numérico circular (`1`, `2`, `3`), título cardinal do subfoco e parágrafo tático de conduta com palavras-chave em negrito.
* **Comportamento do Filtro de Bancas (Mandatório):**
  - O seletor de bancas no topo (`Todas`, `AMRIGS`, `SUS-SP`, `UNESP`, `UNICAMP`, etc.) deve ser **100% reativo**.
  - Ao clicar em uma banca:
    1. As fatias do Donut são recalculadas a partir de `analytics.bancaBreakdown[banca]`.
    2. O percentual central, o total de questões e as barras de progresso horizontais atualizam dinamicamente com transição suave.
    3. O box inferior passa a destacar a conduta do subfoco predominante daquela instituição.

### B. Carrossel de Pontos-Chave das Provas (KeyPointsCarousel)
* **Localização:** Posicionado estrategicamente antes das referências oficiais.
* **Comportamento Obrigatório:**
  - **Loop Circular Infinito:** Passar do último card leva ao primeiro e vice-versa sem travamentos.
  - **Navegação Multicanal:** Suporte a cliques nos botões de seta, atalhos por teclado (setas esquerda $\leftarrow$ e direita $\rightarrow$) e arrasto/touch swipe em dispositivos móveis.
  - **Identidade do Usuário:** Indicador visual de progresso (pontos de paginação) sincronizado com a cor primária de acento (`accentConfig.primaryHex`).

### C. Calculadoras de Escores & Apoio Decisório (`clinical-score`)
* **Propósito:** Ferramentas interativas onde o aluno clica em critérios semiológicos e a pontuação/conduta atualiza em tempo real.
* **Exemplos Obrigatórios:**
  - **Índice de Bishop:** Cálculo interativo de altura de apresentação, dilatação, apagamento, consistência e posição do colo $\implies$ Indicação de Misoprostol vs. Ocitocina.
  - **MEOWS / Alerta de Sepse Materna:** Checagem de sinais vitais $\implies$ Deflagração do Pacote de 1ª Hora.
  - **Escore STEPW de Lasmar:** Parâmetros histeroscópicos de miomas $\implies$ Miomectomia tempo único vs. preparo pré-operatório.

---

## 🔍 3. Checklist de Validação da Skill (Quality Assurance)

Ao validar as ferramentas interativas de um material de estudo, a Skill audita:
- [x] O Raio-X recalcula o Donut e as barras ao clicar em qualquer uma das bancas disponíveis?
- [x] O botão "Todas" restaura o censo global original sem perda de integridade?
- [x] A animação do Donut está protegida contra interrupção por toques na tela móvel?
- [x] O carrossel de pontos-chave funciona com setas do teclado e swipe de toque?
- [x] O contraste das cores do Donut e das barras atende às diretrizes WCAG AAA no tema claro e escuro?
- [x] Blocos customizados `diff-diagnosis` e `clinical-score` são interceptados nativamente como componentes ricos (Zero exposição de código JSON bruto)?

---

## 🛡️ 4. Interceptação Nativa de Blocos de Código (Zero Raw JSON)

Nenhum bloco de código customizado pode vazar para a interface do aluno em formato de terminal (`<pre><code>`):
1. **Blocos `diff-diagnosis`:** Devem renderizar uma matriz comparativa quadricular ou horizontal com cards individuais para cada doença, exibindo período de instalação, curva térmica, sinais cardinais e conduta padrão-ouro destacada.
2. **Blocos `clinical-score`:** Devem renderizar a tabela formal com parâmetros, faixas normais, gatilhos de alerta destacados em vermelho e o card de conduta com o pacote de medidas imediatas (ex: Pacote da 1ª Hora na sepse materna).
