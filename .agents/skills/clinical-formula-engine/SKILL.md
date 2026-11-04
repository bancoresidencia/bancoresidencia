---
name: clinical-formula-engine
description: Motor normativo, engenharia de sintaxe e padronização matemática para fórmulas clínicas, tríades semiológicas, escores e algoritmos no Banco Residência. Previne quebras de parser, garante compatibilidade KaTeX e assegura renderização limpa e elegante em resumos e flashcards.
---

# Clinical Formula Engine: Padrão Normativo de Fórmulas e Algoritmos Médicos

Este manual estabelece o **contrato sintático obrigatório** para toda e qualquer representação matemática, escore semiológico, relação hemodinâmica ou algoritmo clínico na plataforma **Banco Residência**.

---

## 📐 1. Princípios de Renderização: Zero Quebras & Zero Texto Cru

1. **Proibição de Código LaTeX Exposto:**
   - É terminantemente proibido que o usuário veja strings com barras invertidas, como `\begin{cases}`, `\text{...}` ou `\frac{...}{...}` soltas na tela.
   - Toda fórmula deve ser interpretada e renderizada como um componente tipográfico elegante ou cartão matemático centralizado.

2. **Delimitação Estrita:**
   - **Fórmulas de Bloco (Destaque Central):** Obrigatoriamente delimitadas por `$$` no início e `$$` no final em linhas dedicadas.
     ```markdown
     $$
     \text{Índice de Choque (SI)} = \frac{\text{FC (bpm)}}{\text{PAS (mmHg)}}
     $$
     ```
   - **Termos Matemáticos em Linha (Inline):** Obrigatoriamente delimitados por `$` simples: `$SI \ge 0,9 \implies \text{Hemorragia Oculta}$`.
   - **Proibição:** Nunca misturar delimitadores ou esquecer o fechamento do bloco `$$`.

3. **Operadores de Implicação e Raciocínio Clínico:**
   - Utilizar estritamente os símbolos canônicos de lógica médica:
     - `\implies` ($\implies$) para "indica conduta / resulta em".
     - `\iff` ($\iff$) para "critério diagnóstico estrito (se e somente se)".
     - `\ge` ($\ge$) e `\le` ($\le$) para pontos de corte numéricos.
     - `\approx` ($\approx$) para valores aproximados de normalidade.
     - `\times` ($\times$) para multiplicação ou dimensões tumorais ($4 \times 5\text{ cm}$).

---

## 🧮 2. O Ambiente Canônico de Chaves Clínicas (`cases`)

Muitas entidades médicas consagradas são definidas por tríades, tétrades ou critérios diagnósticos agrupados (ex: *Tríade de Bumm da Endometrite*, *Tríade de Virchow do Trombembolismo*, *Tríade de Beck do Tamponamento Cardíaco*).

### Sintaxe Canônica para Critérios Agrupados:

```latex
$$
\text{Entidade Clínica} \implies \begin{cases} 
\text{1. Primeiro Critério Cardinal} \\ 
\text{2. Segundo Critério Cardinal} \\ 
\text{3. Terceiro Critério Cardinal} 
\end{cases}
$$
```

### Regras Mandatórias para o Bloco `cases`:
1. **Quebra de Linha com Barra Dupla:** Cada item dentro de `cases` deve ser finalizado por `\\`.
2. **Textos em `\text{...}`:** Qualquer termo clínico em português deve estar contido em `\text{...}` para preservar acentuação e espaçamento tipográfico adequado.
3. **Numeração Alinhada:** Os itens da chave devem ser numerados (`1. `, `2. `, `3. `) para facilitar a memorização imediata.

---

## ⚠️ 3. Frações Clínicas com Suporte a Chaves Aninhadas

Para escores e índices com frações:
* O numerador e o denominador devem utilizar chaves fechadas `{}`:
  ```latex
  $$\text{Fração de Exjeção} = \frac{\text{VDF} - \text{VSF}}{\text{VDF}} \times 100$$
  ```
* Se houver expressões dentro do numerador, use `\text{...}` dentro da chave do `\frac`.

---

## 🛡️ 4. Checklist do Linter da Skill (Quality Assurance)

Antes de homologar qualquer resumo com expressões matemáticas, a Skill verifica:
- [x] O bloco matemático abre com `$$` e fecha com `$$`?
- [x] Ambientes `\begin{cases}` possuem o respectivo fechamento `\end{cases}`?
- [x] Todos os itens internos ao `cases` são separados por `\\`?
- [x] Nenhum caractere `\` sobrou sem tratamento ou exposto como texto cru?
- [x] Se inserido em arquivos JSON ou TypeScript, as barras invertidas foram devidamente escapadas (`\\` $\rightarrow$ `\\\\` em strings literais)?
- [x] Tríades e ambientes cases são renderizados como cards verticais empilhados (e nunca colapsados em linha horizontal com bullets)?

---

## 📱 5. Apresentação Empilhada Obrigatória (Proibição de Colapso em Linha Única)

- Tríades, tétrades e ambientes `cases` **nunca devem ser colapsados em uma única linha horizontal** com marcadores simples (ex: `Entidade ⟹ 1. ... • 2. ... • 3. ...`).
- O parser do leitor (`StudyMaterialReader.tsx`) intercepta obrigatoriamente a sintaxe:
  `$$\text{Entidade} \implies \begin{cases} \text{1. Item A} \\ \text{2. Item B} \\ \text{3. Item C} \end{cases}$$`
  e transforma em um **card visual de alto rendimento**:
  - Badge lateral com ícone de prescrição/diagnóstico (`Tx`) e rótulo `DEFINIÇÃO / TRÍADE CANÔNICA`.
  - Nome da patologia em tipografia pesada.
  - Seta direcional estilizada `⟹`.
  - **Pilha vertical de cartões de critérios**, cada um com seu indicador circular colorido (`1`, `2`, `3...`) e texto nítido.
