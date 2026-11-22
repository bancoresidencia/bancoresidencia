# PLANO MESTRE EXAUSTIVO: Caneta Inteligente com Reconhecimento de Gestos e Seleção de Questões
> **Banco Residência** • Arquitetura de Inking, Computação Gráfica e Seleção Pedagógica  
> **Status:** 100% Completo • Pronto para Importação no Codex / Cursor / Claude Code  
> **Arquivo:** `docs/PLANO_CANETA_INTELIGENTE_GESTAO_RESPOSTAS.md`

---

## 🎯 Instrução Canônica para o Agente de Código (Codex / Cursor)

```markdown
Você deve implementar o módulo "Caneta Inteligente na Questão" seguindo rigorosamente as 7 etapas detalhadas abaixo.
- Stack: Next.js (App Router), React, TypeScript estrito (zero `any`, sem `@ts-ignore`), Tailwind CSS, Lucide React e HTML5 Canvas PointerEvents.
- Obedeça à regra de modularidade: arquivos até ~350 linhas. Isole matemática pura em `src/utils/`, hooks em `src/hooks/` e componentes visuais em `src/components/`.
- Critério de Aceite Final: `npm run lint && npm run build && npm test`.
```

---

## 🗺️ Índice Geral das 7 Etapas de Implementação

1. [Etapa 1: Motor Matemático Puro de Gestos (`src/utils/strokeGestureMath.ts`)](#etapa-1)
2. [Etapa 2: Suíte de Testes Automatizados (`tests/strokeGestureMath.test.ts`)](#etapa-2)
3. [Etapa 3: Hook de Reconhecimento e Mapeamento DOM (`src/hooks/useStrokeGestureRecognizer.ts`)](#etapa-3)
4. [Etapa 4: Camada Visual Canvas com Palm Rejection (`src/components/QuestionInkingCanvas.tsx`)](#etapa-4)
5. [Etapa 5: Integração no Card da Questão (`src/components/QuestionCard.tsx`)](#etapa-5)
6. [Etapa 6: Integração na Barra de Ferramentas e Atalhos (`src/components/QuestoesView.tsx`)](#etapa-6)
7. [Etapa 7: Tratamento dos Modos Estudo vs Simulado e Quality Gates](#etapa-7)

---

<a id="etapa-1"></a>
## 📐 Etapa 1: Motor Matemático Puro de Gestos (`src/utils/strokeGestureMath.ts`)

**Objetivo:** Criar um módulo desacoplado e determinístico (< 3ms) que analisa arrays de pontos 2D `[{x, y, pressure, time}]` e classifica o gesto humano sem depender de redes neurais pesadas.

### Tipos Obrigatórios
```ts
export interface Point2D {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export type GestureType = 
  | 'CIRCLE'           // Círculo ou elipse fechada contornando a letra ou alternativa
  | 'FILL_SCRATCH'     // Pintura / preenchimento da bolinha (movimento vai-e-vem denso)
  | 'CROSS_X'          // Gesto de 'X' ou cruz sobre o botão da alternativa
  | 'STRIKE_LINE'      // Risco horizontal contínuo sobre o texto (eliminação de distrator)
  | 'TEXT_HIGHLIGHT'   // Grifo ou sublinhado de palavras isoladas (não seleciona)
  | 'FREE_STROKE';     // Anotação livre, cálculo na margem ou seta

export interface GestureResult {
  type: GestureType;
  bounds: BoundingBox;
  confidence: number;
  totalLength: number;
}
```

### Algoritmos e Heurísticas de Classificação:
1. **`calculateBounds(points: Point2D[]): BoundingBox`**: Retorna extremidades, largura, altura e centro.
2. **`calculateStrokeLength(points: Point2D[]): number`**: Soma das distâncias euclidianas entre pontos consecutivos.
3. **Detecção de Círculo / Elipse (`isCircleGesture`)**:
   - Critério 1: Distância entre o primeiro ponto $P_0$ e o último ponto $P_n$ dividida pelo comprimento total é $< 0.30$ (o laço se fechou ou quase se fechou).
   - Critério 2: A razão de aspecto `width / height` está entre $0.55$ e $1.80$.
   - Critério 3: O ponto central da bounding box está cercado por pontos nos 4 quadrantes (Norte, Sul, Leste, Oeste).
4. **Detecção de Pintura / Preenchimento de Bolinha (`isFillScratchGesture`)**:
   - Bounding box compacta ($\le 65\text{px} \times 65\text{px}$).
   - Comprimento total longo ($\ge 180\text{px}$).
   - Múltiplas inversões de sinal na velocidade horizontal e vertical ($\ge 4$ zigue-zagues).
5. **Detecção de 'X' ou Cruz (`isCrossGesture`)**:
   - Suporta um traço único com retorno agudo em diagonal ou dois traços desenhados em intervalo $< 350\text{ms}$.
   - Interseção geométrica dos segmentos no terço central da bounding box.
6. **Detecção de Risco Horizontal de Eliminação (`isStrikeLineGesture`)**:
   - `width / height > 3.2`.
   - Variação angular média em relação ao eixo X $< 20^\circ$.
7. **Detecção de Grifo de Texto (`isTextHighlight`)**:
   - Traço feito com ferramenta marca-texto cuja altura não ultrapassa a altura de uma linha de texto (~24px).

---

<a id="etapa-2"></a>
## 🧪 Etapa 2: Suíte de Testes Automatizados (`tests/strokeGestureMath.test.ts`)

**Objetivo:** Garantir 100% de cobertura das heurísticas matemáticas com testes em Vitest/Node.

### Casos de Teste Mandatórios:
1. `should detect an approximate circle around alternative badge`: pontos simulando um círculo de raio 25px ao redor de `(100, 100)`.
2. `should detect a filled/scratched bubble`: pontos simulando 6 zigue-zagues rápidos em área de 30x30px.
3. `should detect a cross (X)`: dois traços diagonais cruzados.
4. `should detect horizontal strikethrough line`: linha de `(50, 100)` até `(350, 105)` classificando como `STRIKE_LINE`.
5. `should NOT classify single word highlight as option selection`: traço de 80px sobre texto sem circundar o badge.
6. `should handle edge cases`: traço com 1 ou 2 pontos (não quebrar), coordenadas negativas, traços nulos.

---

<a id="etapa-3"></a>
## 🔗 Etapa 3: Hook de Mapeamento DOM (`src/hooks/useStrokeGestureRecognizer.ts`)

**Objetivo:** Traduzir as coordenadas do canvas para os elementos HTML das alternativas.

### Estrutura do Hook:
```ts
export interface OptionTargetBounds {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  badgeRect: DOMRect;   // O círculo da letra (ex: 36x36px)
  cardRect: DOMRect;    // O card retangular da opção
}

export function useStrokeGestureRecognizer(options: {
  containerRef: React.RefObject<HTMLElement | null>;
  onSelectOption: (letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  onEliminateOption: (letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
})
```

### Regras de Colisão (Hit-Testing):
* **Seleção:** Se o gesto for `CIRCLE`, `FILL_SCRATCH` ou `CROSS_X` e o centro da BoundingBox do gesto estiver dentro do `badgeRect` (ou cobrir o `badgeRect` em pelo menos 60%).
* **Eliminação:** Se o gesto for `STRIKE_LINE` e cortar horizontalmente o corpo do `cardRect`.
* **Segurança:** Converte coordenadas absolutas do ponteiro (`clientX`, `clientY`) usando `containerRef.current.getBoundingClientRect()` para garantir precisão mesmo com rolagem de página ou redimensionamento.

---

<a id="etapa-4"></a>
## 🎨 Etapa 4: Camada Visual Canvas com Palm Rejection (`src/components/QuestionInkingCanvas.tsx`)

**Objetivo:** Fornecer a experiência física de escrita com latência zero e suporte pleno a Apple Pencil e S-Pen.

### Especificações Técnicas:
1. **Container e Canvas:**
   - `<canvas className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-20 pointer-events-auto" />`.
   - `touch-action: none` obrigatório para evitar gestos de scroll/zoom indesejados durante o desenho.
2. **Rejeição de Palma (Palm Rejection):**
   - Usa `e.pointerType === 'pen'`: quando uma caneta stylus ativa for detectada, eventos com `e.pointerType === 'touch'` (palma da mão) são ignorados para desenho.
3. **Suporte a 120Hz:**
   - Captura eventos intermediários de alta taxa via `e.getCoalescedEvents?.()`.
4. **Ferramentas Suportadas:**
   - **Caneta (Pen):** Largura 2px, cor sólida adaptada ao tema (Dark/Light).
   - **Marca-texto (Highlighter):** Largura 14–16px, amarelo `#fde047`, `ctx.globalCompositeOperation = 'multiply'`.
   - **Borracha (Stroke Eraser):** Ao passar o ponteiro sobre qualquer segmento de um traço existente, remove o traço inteiro.
5. **Persistência Local Leve:**
   - Salva e restaura traços em `localStorage` sob a chave `hipocampus_strokes_${questionId}`.
   - Formato compacto de pontos vetoriais (< 2 KB por questão).

---

<a id="etapa-5"></a>
## 🧩 Etapa 5: Integração no Card da Questão (`src/components/QuestionCard.tsx`)

**Objetivo:** Conectar o canvas à lógica existente de resolução e eliminação de alternativas do `QuestionCard`.

### Ações a Realizar:
1. Adicionar identificadores de busca DOM nos botões das opções:
   - `data-option-card={option.letter}`
   - `data-option-badge={option.letter}`
2. Adicionar o overlay condicional quando o modo caneta estiver ativo:
   ```tsx
   {isInkingActive && (
     <QuestionInkingCanvas
       questionId={question.id}
       containerRef={cardContainerRef}
       onSelectOption={handleGestureSelectOption}
       onEliminateOption={handleGestureEliminateOption}
     />
   )}
   ```
3. Implementar os callbacks:
   - `handleGestureSelectOption(letter)`: seleciona a alternativa correspondente e submete a resposta (se em modo de estudo).
   - `handleGestureEliminateOption(letter)`: aciona o mesmo estado de `eliminatedOptions[letter]` já existente no card.

---

<a id="etapa-6"></a>
## 🎛️ Etapa 6: Barra de Ferramentas e Atalhos (`src/components/QuestoesView.tsx`)

**Objetivo:** Oferecer botões intuitivos e atalhos de teclado ágeis.

### Elementos da Interface:
1. **Botão no Cabeçalho Superior:**
   - Ícone de Caneta (`Pen` / `Pencil`) ao lado do seletor de fonte e marca-texto.
   - Tooltip explicativo: *"Caneta na questão [P]: risque e circule direto com caneta, touch ou mouse."*
2. **Atalho de Teclado:**
   - Tecla `P` alterna o modo caneta (Liga/Desliga).
3. **Barra Flutuante Compacta:**
   - Surge no canto superior direito da questão ativa quando o modo caneta está ligado:
     `[ ✏️ Caneta ]  [ 🖍️ Marca-texto ]  [ 🧹 Borracha ]  [ ↩️ Desfazer ]  [ 🗑️ Limpar ]`

---

<a id="etapa-7"></a>
## 🚦 Etapa 7: Tratamento dos Modos Estudo vs Simulado e Quality Gates

### 7.1. Comportamento Diferenciado
* **Em Modo Estudo (QuestoesView com Gabarito Imediato):**
  - O gesto de seleção na letra `A` dispara `handleSelectOption('A')` + `submitAnswer({ selectedOption: 'A' })`.
  - Exibe na hora a validação de acerto/erro (verde/vermelho) e abre os comentários e justificativas.
* **Em Modo Simulado / Prova Cronometrada (Simulados):**
  - O gesto de seleção na letra `A` grava a opção no cartão-resposta do simulado.
  - **NÃO revela o gabarito nem comentários** até o encerramento formal do simulado.
  - Atualiza o indicador visual da questão no grid de navegação da prova como *"Respondida"*.

### 7.2. Quality Gate e Definition of Done
Toda a implementação deve passar com sucesso nos comandos:
```bash
npm run test:irt                # Não quebrar psicometria
npx vitest run tests/stroke     # Testes da caneta inteligente
npm run lint                    # Zero erros de lint
npm run build                   # Compilação limpa do Next.js Turbopack
```
