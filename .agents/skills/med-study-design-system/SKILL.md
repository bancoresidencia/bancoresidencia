---
name: med-study-design-system
description: Sistema de design, engenharia de interface e padronização visual canônica para materiais de apoio (resumos clínicos e flashcards) da plataforma médica. Define as regras de componentes nativos interativos (Donut Recharts, cards multicolunas, timelines decisórias compactas, carrossel de pérolas, navegação rápida sticky com scroll spy e renderização de fórmulas matemáticas).
---

# Design System Canônico para Materiais de Apoio (Resumos e Flashcards)

Este manual estabelece o **padrão visual e arquitetural obrigatório** para todo e qualquer resumo clínico e material de estudo produzido para a plataforma de Residência Médica, Revalida e R+.

---

## 🏛️ 1. Princípios Fundamentais de UX/UI Médica

1. **Zero Sobrecarga Visual & Densidade Respeitosa:**
   - O estudante de medicina estuda por horas consecutivas. A interface deve ser **arejada, escaneável e agradável aos olhos**.
   - **Proibição de Colunas Comprimidas:** É proibido espremer 4 itens em 4 colunas verticais estreitas (`grid-cols-4`). Cards verticais finos forçam quebras de linha a cada duas palavras, geram altura excessiva e causam fadiga cognitiva.
   - **Disposição em Matriz 2x2 (2 Linhas x 2 Colunas):** Conjuntos de 4 entidades clínicas (ex.: 4 Ts da HPP, 4 classes de choque, 4 graus de rotura) devem ser obrigatoriamente organizados em **grade de 2 colunas e 2 linhas** (`grid-cols-1 md:grid-cols-2`). Isso garante largura confortável, leitura horizontal natural e espaçamento equilibrado.

2. **Microcopy Cirúrgico & Informação Objetiva:**
   - Evitar blocos densos de texto corrido dentro de cards esquemáticos.
   - Cada card deve conter no máximo **3 bullet points telegráficos**, focados exclusivamente em:
     * `[Achado Cardinal]:` Sinal clínico ou laboratorial definitivo.
     * `[Fator de Risco Crítico]:` Associação estatística de prova.
     * `[Conduta Inicial]:` Ação imediata de pronto-socorro.
   - A caixa inferior de `Prova:` deve conter uma sentença direta e impactante (máximo de 2 linhas).

3. **Zero Diagramas Mermaid Escuros & Zero SVGs Artificiais:**
   - É terminantemente proibido utilizar ````mermaid pie````, ````mermaid flowchart```` ou badges sintéticas `data:image/svg+xml`.
   - Toda representação estatística, etiológica ou algorítmica deve ser convertida em **componente React nativo** interceptado pelo leitor [`StudyMaterialReader.tsx`](file:///c:/bancoresidencia/bancoresidencia/src/components/StudyMaterialReader.tsx).

4. **Hierarquia Visual e Tipográfica Estrita:**
   - **Diferenciação Visual entre Tópicos e Subtópicos:** Subtópicos em listas não podem parecer itens planos soltos. Devem ser renderizados com:
     * Nível 0 (Tópico Principal): Ponto de destaque na cor de acento do tema (`accentConfig.primaryHex`), texto em peso médio/destacado.
     * Nível 1 (Subtópico): Recuo explícito (`ml-5 sm:ml-6 pl-3 sm:pl-4`), borda lateral conectora vertical (`border-l-2 border-zinc-200 dark:border-zinc-700/60`), marcador de derivação (`↳`) e tom de cor secundário (`text-zinc-600 dark:text-zinc-300`).
     * Nível 2 (Sub-subtópico): Recuo adicional (`ml-9 sm:ml-11 pl-3 border-l-2 border-zinc-200/60 dark:border-zinc-800`), traço conector (`—`).
   - **Fórmulas Matemáticas Clínicas:** Fórmulas (ex.: Índice de Choque, Bishop, clearance, Lasmar) devem ser renderizadas em **cartões matemáticos centrais** com frações limpas (numerador sobre denominador separados por barra horizontal estilizada), nunca vazando código LaTeX como `\frac{...}{...}` ou `\text{...}`.
   - **Regra de H1 Único:** O leitor de materiais de estudo já renderiza o título oficial (`material.title`) em seu cabeçalho. Qualquer título H1 (`# `) presente no corpo do markdown deve ser ignorado para evitar duplicação imediata no topo da tela.

---

## 🎨 2. Componentes Visuais Canônicos

### A. Raio-X de Recorrência em Provas (Donut Chart)
* **Cabeçalho Limpo:** Apenas o ícone temático e o título `Raio-X de Recorrência nas Provas de Residência Médica`. É proibido poluir o topo com badges como `+10k Questões Auditadas`, legendas como `Frequência Temática` ou subtítulos redundantes como `Taxa relativa de cobrança...`.
* **Gráfico:** Donut Recharts com raio interno de 65 e raio externo de 92.
* **Proibição de Tooltip Preto:** Não utilizar popover preto flutuante que tampe o centro do donut.
* **Animação Intocável & Imune a Toques na Tela (Zero Interrupção):**
  * Toda e qualquer animação de pizza/donut na plataforma (Home, Stats, Resumos) deve ser **imune a interrupção por toque na tela ou rolagem móvel**.
  * Configuração mandatória no `<Pie>`:
    * `animationBegin={0}` (sem atraso inicial).
    * `animationDuration={800}` e `animationEasing="ease-out"`.
    * Enquanto a animação roda (`!isPieAnimationDone`), o container do SVG deve adotar `pointer-events-none` e os handlers de hover/clique devem ignorar eventos.
    * No término (`onAnimationEnd`), `isAnimationActive` é desligado (`false`) e `pointer-events-auto` é restaurado, impedindo que toques posteriores resetem ou congelem o arco do gráfico em posições intermediárias.
* **Centro Reativo Proporcional e Limpo:**
  * O centro do donut exibe exclusivamente o percentual em tamanho equilibrado e confortável (`text-2xl sm:text-3xl font-heading font-black`) e a legenda `"recorrência em provas"` (`text-[10px]`).
  * **Proibição de Números Desproporcionais ou Nomes no Centro:** É proibido usar fontes gigantescas que toquem as bordas do donut ou repetir o nome do tema no interior do círculo.
* **Lista Ranqueada de Barras:**
  * **Quantidade de Questões:** No canto direito de cada item, exibir a quantidade absoluta de questões (`{item.questionCount} questões`), em vez da porcentagem (já representada pelo gráfico e pelas barras).
  * **Design & Animação no Padrão Canônico (Miomas):** Cards com borda sutil (`border-zinc-100 dark:border-zinc-800/60`), sem opacidade esmaecida (100% legíveis). No hover/seleção, ganham destaque tátil (`scale-101 shadow-xs border-zinc-300 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-800/80`). Barras de progresso com animação fluida `transition-all duration-500 ease-out`.
  * **Rolagem Vertical para > 5 Tópicos:** Quando a lista temática contiver mais de 5 tópicos, o container deve ativar rolagem vertical suave (`max-h-[310px] overflow-y-auto pr-1`), preservando a altura total harmoniosa do componente.
* **Interação:**
  * O clique no setor ou na legenda fixa a seleção (**Lock de Seleção**), destacando o item ativo no donut (opacidade 1.0) e clareando os inativos (opacidade 0.28).
* **Rodapé de Cobrança Direta:**
  * Caixa horizontal inferior de largura total trazendo explicação direta, cirúrgica e telegráfica com termos em negrito sobre como a banca cobra o tema ativo em questões práticas.

### B. Esquemas Clínicos em Matriz (Topografia & Etiologias)
* **Regra de Distribuição Espacial:**
  * **Para 4 Entidades Clínicas (ex.: Regra dos 4 Ts):** Utilizar obrigatoriamente **Matriz 2x2 (2 colunas e 2 linhas)** com `grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`.
  * **Para 3 Entidades Clínicas (ex.: Miomas Submucosos, Intramurais e Subserosos):** Utilizar **3 colunas** (`grid-cols-1 md:grid-cols-3 gap-4`).
* **Anatomia do Card em Matriz 2x2:**
  * **Cabeçalho:** Título + ícone temático + badge de frequência/gravidade em linha única com divisória sutil.
  * **Corpo:** Subtítulo de padrão clínico + 2 a 3 tópicos enxutos com marcadores coloridos.
  * **Rodapé:** Caixa de chamada de alta visibilidade:
    * `🚫 Prova:` Contraindicações formais da banca.
    * `⚠️ Prova:` Armadilhas de diagnóstico diferencial e conduta.
    * `✓ Prova:` Padrão-ouro mandatório.

### C. Algoritmos Decisórios & Linhas do Tempo
* **Passo a Passo Sintético Anterior:**
  * O fluxograma deve ser sempre precedido por um resumo em tópicos curtos (Passo 1 a Passo N) para leitura rápida.
* **Componente Compacto:**
  * O card do algoritmo deve ser compacto, com seletores de passos numerados no topo, janela de tempo, ações práticas diretas e doses exatas de fármacos.
  * **Ponto Principal Imediato:** Cada passo deve abrir obrigatoriamente com uma caixa de destaque (`Target` icon) trazendo o **Ponto Principal da Prova** em sentença cirúrgica com termos cardinais em negrito.
  * **Tipografia e Densidade:** Utilizar tipografia padrão do resumo (`text-xs` / `leading-snug`), sem parágrafos longos, distribuindo em 2 colunas equilibradas (Ações Imediatas vs. Doses & Dispositivos de Escolha) e caixa inferior de pegadinha (`pearl`).

### D. Navegação Rápida Sticky com Scroll Spy
* **Posição e Doca:**
  * Fixa na rolagem da página abaixo do header principal (`sticky top-[4.5rem] z-20`) com fundo translúcido em desfoque (*backdrop-blur*).
  * **Bordas Retangulares:** Ao fixar, utilizar bordas retangulares (`rounded-none`) para vedar perfeitamente os limites da tela e não criar sobreposições estéticas estranhas.
  * Sem label descritivo redundante (proibido usar `"TÓPICOS:"`).
  * Sem barra de rolagem horizontal nativa visível (`scrollbar-none [&::-webkit-scrollbar]:hidden`).
* **Auto-Scroll Inteligente:**
  * O pill correspondente ao tópico que o estudante está visualizando no momento acende dinamicamente com a cor do tema ativo (`accentConfig.primaryHex`).
  * Conforme o estudante rola a página, a barra de tópicos centraliza automaticamente e com transição suave o pill ativo via `scrollIntoView({ behavior: 'smooth', inline: 'center' })`, sem exigir arraste manual.

### E. Carrossel de Pontos-Chave das Provas
* **Localização Mandatória:** No final do resumo, posicionado **imediatamente antes** da seção `## Diretrizes Oficiais & Consensos de Referência`.
* **Design e Interatividade:**
  * **Loop Circular Infinito:** O carrossel deve permitir navegação circular contínua. Quando o estudante estiver no Card 1, à sua esquerda (anterior) deve ser exibido o último card (ex.: Card 8), criando uma janela de visualização em 3 posições (`[prevIdx, currIdx, nextIdx]`).
  * **Transição Suave de Animação:** Ao trocar de card (por botões `<` `>`, teclado ou touch swipe), o card central deve transicionar com animação fluida deslizante (`transition-all duration-300 ease-out animate-in fade-in` com direção `slide-in-from-right-4` ou `slide-in-from-left-4`), e os cards laterais acompanham a transição com suavidade.
  * **Cores Adaptadas ao Tema do Estudante:** O card ativo, os números nos círculos e os efeitos de realce devem adotar dinamicamente a cor do tema ativo (`accentConfig.primaryHex` e `accentConfig.bgRgba`), harmonizando perfeitamente caso o estudante use Rosa, Azul, Esmeralda, Violeta, Âmbar ou Neutro.
  * **Eliminação de Ruído Textual nos Cards:** 
    * Proibido incluir rodapés com textos repetitivos como `"Regra Decisiva da Prova"` ou `"Ponto #X"`.
    * Proibido repetir `"X de Y"` no topo do card.
    * O card deve apresentar exclusivamente o numeral em círculo temático e a regra de ouro médica com termos essenciais em negrito.
  * Card central em foco destacado (`scale-100 opacity-100 shadow-md`), com cards laterais adjacentes desfocados (`scale-95 opacity-35 blur-[0.5px]`).
  * Sem ícones genéricos (como sparkle) no cabeçalho.
  * Navegação completa por teclado (teclas `ArrowLeft` e `ArrowRight`), gestos de toque móvel (touch swipe) e botões de seta acessíveis (`<` e `>`), sem estados desabilitados.

### F. Referências Oficiais
* **Posicionamento Obrigatório:** Exclusivamente no final do material sob a seção `## Diretrizes Oficiais & Consensos de Referência`, nunca na abertura do resumo.

---

## 🔍 3. Protocolo de Validação de Design (Design Quality Gate)

Antes de aprovar e integrar qualquer resumo na plataforma, execute o teste automatizado:
```bash
python scripts/validate_study_material_design.py
```
Critérios de reprovação imediata:
1. Existência de compressão inadequada de 4 colunas finas (`grid-cols-4` para textos densos).
2. Existência de `\frac` ou sintaxe LaTeX crua no texto.
3. Existência de ````mermaid pie```` ou ````mermaid flowchart````.
4. Existência de referências ou citações institucionais no topo do resumo.
5. Presença de seção estática de "Pontos-Chave" duplicando conteúdo do carrossel.
6. Ausência de componentes visuais canônicos homologados.
