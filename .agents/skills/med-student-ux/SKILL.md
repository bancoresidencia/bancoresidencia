---
name: med-student-ux
description: "Diretrizes de excelência em UX/UI e Engenharia de Front-End para plataformas de preparação médica de alto rendimento. Foco em redução drástica de carga cognitiva, eliminação de ruído textual (microcopy cirúrgico), cards compactos e funcionais, modo escuro neutro verdadeiro (zero tom azulado) e arquitetura de botões dinamicamente adaptados ao tema e acento cromático do estudante (incluindo Rosa e Neutro)."
argument-hint: "[component, screen, or design-token]"
license: MIT
metadata:
  author: frontend-ux-architect
  version: "1.0.0"
---

# MedStudent UX Core — Engenharia de Interface e Psicometria Visual

> **Missão Primária:** Prover ao estudante de medicina uma interface de alto desempenho, ergonômica, de ultra-baixa carga cognitiva e focada 100% na resolução de questões, constância diária e retenção mnemônica.

---

## 1. Princípios de Engenharia de UX & Psicologia Cognitiva

Estudantes que se preparam para provas de Residência Médica (ENARE, USP, AMRIGS, PSU-MG, SUS-SP) e Revalida estudam entre 4 e 10 horas diárias sob fadiga contínua. Cada pixel desnecessário, texto redundante ou contraste desbalanceado rouba energia atencional do usuário.

### 1.1. As Leis Fundamentais Aplicadas

1. **Teoria da Carga Cognitiva (Sweller):**
   - **Carga Intrínseca:** O raciocínio clínico da questão médica (irredutível).
   - **Carga Pertinente:** A retenção de conceitos, fórmulas e condutas médicas.
   - **Carga Extrínseca:** A interface, layout, leitura desnecessária e botões confusos.
   - *Regra de Ouro:* A carga extrínseca deve ser virtualmente **zero**. A interface deve se tornar invisível.

2. **A Regra dos 3 Segundos (Nielsen Norman Group):**
   Ao abrir a página inicial, em menos de 3 segundos o aluno precisa identificar:
   - O que ele já realizou hoje (meta de questões e tempo).
   - Qual a sua proximidade da prova alvo (dias restantes e constância).
   - Ação imediata: onde clicar para retomar o último caderno resolvido com 1 único toque.

3. **Lei de Hick-Hyman & Decisão Rápida:**
   - Menos opções concorrentes na dobra principal.
   - Apenas **um botão primário** destacado por contexto (CTA forte e inequívoco).
   - Ações secundárias devem usar variações discretas (outline/ghost), jamais disputando luminosidade visual.

4. **Lei de Fitts & Ergonomia:**
   - Áreas de clique confortáveis (mínimo 40px em desktop / 44px em mobile), porém com altura física visualmente compacta (36px a 40px com padding balanceado), evitando botões gigantes que empurram o conteúdo para fora da dobra.

---

## 2. Redução Drástica de Texto (Microcopy Cirúrgico)

### 2.1. O Princípio do Silêncio Visual
Se uma palavra pode ser removida sem perda de contexto técnico ou funcional, ela **deve** ser removida. Proibições formais:
- **Zero texto de boas-vindas pomposo:** Nada de "Bem-vindo à sua jornada de estudos rumo à aprovação". O nome do aluno e um badge discreto da modalidade bastam.
- **Zero legendas redundantes:** Nada de "Cadernos personalizados divididos por temas clínicos e bancas". O título "Cadernos Recentes" já é autoexplicativo.
- **Zero adjetivos de marketing internos:** O aluno já comprou a plataforma; ele não precisa de propaganda dentro do próprio dashboard.

### 2.2. Dicionário de Conversão (Antes vs. Depois)

| ❌ Antes (Prolixo / Pesado) | ✅ Depois (Cirúrgico / Objetivo) | Racional UX |
| :--- | :--- | :--- |
| `Minhas Listas & Cadernos Recentes` | `Cadernos Recentes` | Redução de 5 palavras para 2. |
| `Cadernos personalizados divididos por temas clínicos e bancas` | *(Remover totalmente)* | Subtítulo inútil que empurra a lista para baixo. |
| `Acesso Direto às Áreas da Plataforma` | `Acesso Rápido` | Mais conciso e escaneável. |
| `de constância diária` | `seguidos` ou `em sequência` | Contexto visual da chama dispensa frases longas. |
| `para a prova (ENARE 2026)` | `p/ ENARE 2026` | Otimização para leitura vertical rápida. |
| `Progresso geral diário: 50% concluído` | `50% concluído` | Dado numérico direto com tipografia tabular. |
| `acertos brutos` | `acertos` | Clareza imediata. |
| `Continuar Resolvendo` | `Continuar` | Verbo direto e enxuto. |
| `Gerenciar Todas as Listas` | `Ver todas` | Padrão ergonômico mobile/desktop. |

---

## 3. Arquitetura de Densidade & Geometria de Cards

### 3.1. Compactação de Espaçamento e Proporção
- **Padding de Cards:** Reduzir de `p-7` / `p-9` para `p-4` a `p-5` (mobile: `p-3.5`).
- **Gaps Verticais:** Reduzir de `space-y-9 sm:space-y-11` para `space-y-4 sm:space-y-5`.
- **Bordas e Cantos:** Usar `rounded-2xl` para cards médios e `rounded-xl` para botões e badges. Evitar `rounded-3xl` superdimensionados que consomem espaço útil nas quinas.
- **Altura de Botões de Navegação Rápida:** Reduzir de `h-32` para `h-20` ou `h-22`, transformando-os em blocos eficientes de grade horizontal com ícone e rótulo integrados.

### 3.2. Estrutura do Layout em 4 Blocos Funcionais
1. **Hero Compacto de Status:**
   - Linha superior: Saudação + Nome do aluno + Badge de modalidade.
   - Direita (ou linha secundária no mobile): Contagem regressiva compacta da prova alvo (`dias restantes`) e sequência (`streak`).
2. **Tríade de Metas e Desempenho (3 colunas):**
   - **Card 1: Metas de Hoje:** Questões (resolvidas / meta) + Tempo de estudo (minutos / meta) em barras finas de progresso com botão compacto de ajuste.
   - **Card 2: Aproveitamento:** % de acerto geral em destaque tipográfico Inter/tabular, barra de rendimento minimalista e total resolvidas.
   - **Card 3: Posição / Percentil:** Faixa do percentil oficial (Ex: P78, Nível Ouro), medalha compacta e link sutil para ranking completo.
3. **Card do Caderno Ativo (Ação Primária):**
   - Card horizontal de alta densidade exibindo título do caderno, barra de progresso e botão **Continuar** destacado com a cor do tema do aluno.
4. **Cadernos Recentes & Atalhos:**
   - Grade 2x2 enxuta de cadernos recentes com progresso percentual e atalho de continuação.

---

## 4. O Modo Escuro Verdadeiro (True Neutral Dark — Zero Azulado)

### 4.1. Por que o Azulado Clássico (#070b14, #0d1527) Falha na Medicina
1. **Fadiga Ocular por Radiação Azul:** A luz azul no espectro de telas interfere na melatonina e agrava a vista cansada em estudantes que revisam casos à noite.
2. **Distorção Cromática de Imagens Médicas:** Questões de radiologia (TC, RX, RM), dermatologia e histopatologia exigem fundo preto/cinza neutro para fidelidade de escala de cinza e cores teciduais reais.
3. **Conflito Semiótico:** Um fundo azulado compete visualmente com acentos cianos, azuis e roxos, reduzindo a clareza hierárquica.

### 4.2. Especificação Cromática Neutra (Zinc / Carbon Neutral)

```css
/* Definição de Tokens Oficiais para o Modo Escuro */
html.dark {
  --background: #09090b;       /* Zinc 950 Neutro Absoluto */
  --foreground: #f4f4f5;       /* Zinc 100 com alto contraste */
  --card: #121215;             /* Superfície escura neutra sem tom azul */
  --card-foreground: #f4f4f5;  /* Texto de cartões */
  --card-border: #27272a;      /* Zinc 800 - divisor refinado e sutil */
  --muted: #18181b;            /* Zinc 900 para inputs e superfícies secundárias */
  --muted-foreground: #a1a1aa; /* Zinc 400 para textos secundários legíveis */
  --ring: var(--primary-color);
}
```

---

## 5. Arquitetura de Cores Dinâmicas e Acentos

A plataforma oferece **7 temas cromáticos**, permitindo que o aluno personalize sua identidade de foco. Toda a interface — botões, anéis de foco, barras de progresso ativas e badges — adapta-se à cor selecionada via `--primary-color` e `ACCENT_CONFIGS`.

### 5.1. Matriz de Cores da Plataforma (Incluindo Rosa e Neutra)

| ID | Nome | Hex Primário | Hover | Background RGBA | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `blue` | Azul Clássico | `#2563eb` | `#1d4ed8` | `rgba(37, 99, 235, 0.14)` | Alta confiança clínica e sobriedade |
| `green` | Verde Esmeralda | `#059669` | `#047857` | `rgba(5, 150, 105, 0.14)` | Calma visual e equilíbrio mental |
| `orange` | Laranja Radiante| `#ea580c` | `#c2410c` | `rgba(234, 88, 12, 0.14)` | Alta energia e velocidade |
| `purple` | Roxo Nobre | `#7c3aed` | `#6d28d9` | `rgba(124, 58, 237, 0.14)` | Sofisticação e concentração |
| `red` | Vermelho Carmesim|`#dc2626` | `#b91c1c` | `rgba(220, 38, 38, 0.14)` | Intensidade e senso de urgência |
| `rose` | **Rosa Vibrante** | `#e11d48` | `#be123c` | `rgba(225, 29, 72, 0.14)` | **Modernidade, elegância e acolhimento** |
| `neutral`| **Grafite Neutro**| `#52525b` | `#3f3f46` | `rgba(82, 82, 91, 0.16)` | **Minimalismo estrito e zero distração** |

### 5.2. Regras de Adaptação de Botões aos Temas
1. **Botões Primários (CTA Principal):**
   - Fundo preenchido com a cor primária ativa (`accentConfig.primaryHex` ou estilo via `--primary-color`).
   - Texto em branco de alto contraste (`text-white`).
   - Sombra sutil derivada da cor ativa (`box-shadow: 0 4px 14px var(--accent-muted)`).
   - Efeito hover dinâmico baseado no tom de hover correspondente (`accentConfig.hoverHex`).
2. **Botões Secundários:**
   - Fundo translúcido com `accentConfig.bgRgba` ou neutro suave (`bg-zinc-100 dark:bg-zinc-900`).
   - Borda neutra refinada (`border-zinc-200 dark:border-zinc-800`).
   - Texto no tom do acento ou neutro claro.
3. **Zero Inconsistência:**
   - Não deixar botões azuis ou vermelhos hardcoded quando o aluno escolhe Rosa, Verde ou Neutro. O tema do usuário deve governar a paleta da página inteira.

---

## 6. Lista de Verificação (Checklist) para Implementações

Antes de homologar qualquer alteração na Home do Aluno ou componentes correlatos:

- [ ] **Teste de Redução de Palavras:** A página possui menos de 60% do volume de palavras da versão anterior?
- [ ] **Teste do Fundo Escuro Puro:** Inspecione com conta-gotas (`#09090b` / `#121215`). O fundo está 100% livre de matizes azuis (`#070b14` ou `#0d1527`)?
- [ ] **Teste das Novas Cores:** Ao selecionar **Rosa** ou **Grafite Neutro**, os botões primários, badges e anéis de progresso respondem imediatamente?
- [ ] **Teste de Ergonomia de Cards:** Os paddings e alturas permitem visualizar o status e o caderno ativo sem necessidade de rolagem excessiva em monitores 1080p e tablets?
- [ ] **Teste de Tipografia Tabular:** Todos os números (questões, porcentagens, dias) usam fontes sans tabulares ou fontes mono sem jitter de layout quando atualizados?
- [ ] **Teste de Microcopy:** Algum texto ultrapassa 2 linhas? Se sim, encurte imediatamente.
