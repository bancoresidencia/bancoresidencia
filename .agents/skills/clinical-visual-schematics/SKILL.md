---
name: clinical-visual-schematics
description: Arquiteto, curador e auditor de esquemas visuais modulares de alto rendimento para resumos clínicos da plataforma Banco Residência. Governa a seleção oportuna entre 11 layouts canônicos, aplica o Princípio da Parcimônia Clínica (apenas sob real necessidade pedagógica) e assegura integração harmônica com o texto.
---

# Clinical Visual Schematics: Arquitetura de Esquemas Clínicos de Alto Rendimento

Este manual define o catálogo, as diretrizes de seleção e a auditoria de qualidade para **esquemas visuais modulares** inseridos nos resumos clínicos do **Banco Residência**.

---

## ⚖️ 1. Princípio Fundamental: Parcimônia Clínica & Relevância Real

> [!IMPORTANT] Regra de Ouro da Sobriedade Visual
> **Nenhum esquema visual deve ser inserido por mero capricho estético.**
> O resumo clínico de medicina não é um mural de caixas coloridas; é uma ferramenta de estudo para profissionais que passam horas lendo.
> **Limite Máximo:** No máximo **1 a 2 esquemas visuais por resumo**, e **estritamente se o tema clínico exigir**.

### Critérios de Veto da Skill (Quando NÃO Adicionar Esquema):
- O tema é predominantemente descritivo, linear ou conceitual (ex: ética médica básica, definições simples).
- O conteúdo pode ser explicado de forma mais rápida e elegante em uma lista com marcadores de derivação (`↳`).
- O esquema apenas repetiria de forma idêntica o texto corrido sem agregar poder de síntese.

---

## 🗂️ 2. O Catálogo Canônico de 11 Esquemas Modulares

Quando o preceptor ou o agente de IA identificar real necessidade de síntese, ele deve selecionar **exatamente um** dos 11 modelos abaixo:

| # | Nome do Esquema | Gatilho Clínico de Necessidade | Anatomia Visual |
| :--- | :--- | :--- | :--- |
| **1** | **Bipolar (2 Colunas)** | Fatores de Risco vs. Proteção, Indicações vs. Contraindicações, Vaginal vs. Cesárea. | 2 colunas amplas contrastantes (Vermelho/Verde) com caixas de alerta de prova no rodapé de cada coluna. |
| **2** | **Pipeline Decisório (3 Etapas)** | Investigação armada em cascata obrigatória (Exame 1 $\rightarrow$ Exame 2 $\rightarrow$ Exame 3). | 3 cards sequenciais numerados com badges de indicação (`Exame Inicial`, `Exame para Cavidade`, `Padrão-Ouro`). |
| **3** | **Cenários Clínicos & Farmacoterapia** | Condutas médicas que mudam radicalmente conforme o perfil do paciente (Assintomática / Gestação / Definitivo). | Linha superior com 3 cenários clínicos horizontais + bloco comparativo de drogas/intervenções. |
| **4** | **Matriz 4 Quadrantes (2x2)** | Síndromes regidas por mnemônicos de 4 pilares ou 4 etiologias cardinais (ex: 4 Ts da HPP, 4 classes FIGO). | Grade balanceada 2x2 com paleta semântica quádrupla (Rose, Amber, Blue, Purple) e box de pegadinha. |
| **5** | **Linha do Tempo / Cronologia Clínica** | A etiologia ou conduta varia com base no tempo pós-evento (dias de pós-operatório ou horas da emergência). | Eixo horizontal com nós temporais e marcos clínicos que separam fisiológico de patológico. |
| **6** | **Escada Terapêutica (Step-Up)** | Manejo de patologia grave que frequentemente falha na 1ª linha e exige escalonamento progressivo de invasividade. | Degraus empilhados verticalmente com critérios de falha bem definidos e doses destacadas. |
| **7** | **Matriz Diferencial de Alta Fricção** | 3 a 4 doenças quase idênticas que a banca coloca como distratores nas alternativas. | Tabela comparativa em 3-4 colunas verticais com a "Palavra-Chave Patognomônica" no topo de cada uma. |
| **8** | **Árvore de Decisão Bifurcada** | Triagem de emergência onde a estabilidade hemodinâmica divide o paciente em 2 mundos opostos. | Card superior de gatilho de triagem + Asas bifurcadas (Esquerda: Verde/Estável, Direita: Vermelho/Instável). |
| **9** | **Grid de Escore Preditivo** | Escore numérico clássico onde cada faixa de pontuação impõe uma conduta hospitalar ou cirúrgica distinta. | Tabela com critérios e pontos + 3 cartões horizontais de conduta conforme a faixa (Baixo, Médio e Alto Risco). |
| **10** | **Anatomia Topográfica em Camadas** | Infecções de sítio cirúrgico, feridas ou lacerações onde a profundidade anatômica dita a conduta e o ATB. | Camadas horizontais empilhadas (Pele/Subcutâneo $\rightarrow$ Fáscia/Músculo $\rightarrow$ Cavidade Profunda). |
| **11** | **Cartão de Toxicidade & Antídotos** | Fármacos de alto risco na urgência médica com estreita faixa terapêutica e necessidade de vigilância. | Card de segurança vermelho/âmbar com cronologia de toxicidade, vigilância obrigatória e antídoto de resgate. |

---

## 💻 3. Sintaxe Declarativa no Markdown

Os esquemas são incorporados diretamente no markdown através do bloco semântico ````clinical-scheme`:

```markdown
```clinical-scheme
{
  "type": "bipolar",
  "title": "Fatores de Risco vs. Profilaxia Efetiva na Cesárea",
  "subtitle": "Balanço determinante na prevenção da morbidade febril puerperal",
  "badge": "Diretriz FEBRASGO / CDC",
  "leftColumn": {
    "title": "FATORES DE RISCO (Aumentam Incidência)",
    "color": "rose",
    "items": [
      "Trabalho de Parto Prolongado e Toques Vaginais Múltiplos (> 5-6 toques)",
      "Bolsa Rota Prolongada (> 18 horas de rotura de membranas)",
      "Parto por Cesariana de Emergência (Risco 20 a 30 vezes maior que vaginal)"
    ],
    "alert": "Cesariana isolada é o principal fator de risco independente para endometrite pós-parto!"
  },
  "rightColumn": {
    "title": "MEDIDAS DE PROTEÇÃO (Reduzem Risco em até 70%)",
    "color": "emerald",
    "items": [
      "Antibioticoprofilaxia Universal: Cefazolina 2g IV administrada 30-60 min ANTES da incisão na pele",
      "Assepsia Cervicovaginal: Preparo com iodopovidona ou clorexidina antes do procedimento",
      "Extração Espontânea da Placenta com tração controlada do cordão (evitar curagem manual de rotina)"
    ],
    "alert": "Pegadinha de Prova: A profilaxia deve ser feita ANTES da incisão, e não mais após o clampeamento do cordão!"
  }
}
```
```

---

## 🔍 4. Checklist de Auditoria da Skill (Quality Assurance)

Ao auditar um resumo, a Skill verifica:
1. **[Pertinência]:** O esquema selecionado realmente resolve uma dor diagnóstica do tema?
2. **[Concisão]:** Nenhum bullet point contém mais de 3 linhas de texto?
3. **[Pegadinha de Prova]:** O card possui a caixa de alerta com a armadilha mais frequente das bancas?
4. **[Equilíbrio]:** O resumo possui no máximo 1 ou 2 esquemas visuais?
5. **[Contextualização]:** O esquema está posicionado imediatamente após o tópico teórico de fundamentação?
6. **[Anti-Redundância]:** O cabeçalho do esquema não duplica o título da seção imediatamente anterior?
7. **[Zero Text-Dump]:** Não há despejo de listas `#### Quadrante X` abaixo do card visual?

---

## 🚫 5. Regras Anti-Redundância e Anti-Duplicação (Blindagem Estrita)

1. **Proibição de Subtítulo Redundante:** Quando um título de seção (`## 3. Fatores de Risco...`) já introduz o tema, é expressamente proibido inserir um subtítulo intermediário repetindo as mesmas palavras (ex: `Matriz 2x2: Fatores Determinantes de Risco...`).
2. **Título Interno do Card Opcional:** O card do esquema visual deve deixar `title` e `subtitle` vazios/omitidos caso o título da seção já o introduza. O cabeçalho exibirá apenas o badge de diretriz no canto superior direito (`badge: "Diretriz FEBRASGO / CDC"`), eliminando poluição visual.
3. **Proibição de Despejo de Quadrantes em Texto:** Nunca despejar listas markdown com `#### 🔴 Quadrante 1:...` abaixo do card visual. O card visual já é o componente canônico oficial. Despejar o texto abaixo cria poluição e aspecto de rascunho não revisado.
