# Relatório De Auditoria De Filtros, Gabaritos E Metadados Clínicos
**Base Canônica Auditada:** [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db)  
**Tabela de Governança (SSOT):** `questions_curated_staging`  
**Universo Total Auditado:** **254.192 questões**  
**Data da Auditoria:** 12 de Novembro de 2026  
**Status do Pipeline:** Auditoria Diagnóstica Preliminar (Sem Execução ou Alterações)

---

## Executive Summary & Principais Descobertas

Esta auditoria profunda analisou 100% dos registros (254.192 questões) da tabela consolidada `questions_curated_staging`, gerada após a conclusão da Frente 1 de Deduplicação, para diagnosticar falhas estruturais de renderização, consistência dos gabaritos homologados, integridade do campo `type` (múltipla escolha vs. discursivas) e maturidade dos comentários pedagógicos (Padrão-Ouro).

```
                             AUDITORIA GERAL DO ACERVO (254.192 Questões)
┌────────────────────────────────┬────────────────────────────────┬────────────────────────────────┐
│      GABARITOS HOMOLOGADOS     │      ALTERNATIVAS COM BUG      │     COMENTÁRIOS PADRÃO-OURO    │
│        236.783 (93,15%)        │        33.746 (13,28%)         │         5.422 (2,13%)          │
│   Gabaritos válidos (A até E)  │    Sem letra / Não marcáveis   │  Justificativas + Take-Home    │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
┌────────────────────────────────┬────────────────────────────────┬────────────────────────────────┐
│       SEM GABARITO (PEND.)     │        QUESTÕES ANULADAS       │      ANOMALIAS DE GABARITO     │
│         11.764 (4,63%)         │         5.477 (2,15%)          │          168 (0,07%)           │
│    Necessitam cadernos/busca   │    Homologadas oficialmente    │       "!" ou números (ex: 38)  │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

---

## 1. Diagnóstico do Erro Visual: Alternativas Sem Letras e Impossibilidade de Marcação

### 1.1. Causa Raiz Técnica e Rastreamento de Dados
O comportamento reportado (no qual a questão é exibida com círculos seletores vazios, sem as letras "A", "B", "C", "D" ou "E", e o aluno fica incapacitado de clicar ou submeter a resposta) foi reproduzido e dissecado com precisão matemática.

```
                  FLUXO DA QUEBRA: BANCO -> SERVIÇO -> COMPONENTE
┌───────────────────────────────┐
│ questions_curated_staging     │  Array options gravado com chaves:
│ (33.746 questões afetadas)    │  [{"id": "...", "text": "...", "index": 0}, ...]
└───────────────┬───────────────┘  ⚠️ AUSÊNCIA DA PROPRIEDADE "letter"
                │
                ▼
┌───────────────────────────────┐  `cleanOptions = row.options.map(opt => ({`
│ src/services/                 │  `  letter: opt.letter, text: opt.text`
│ questionService.ts (L. 224)   │  `}));`
└───────────────┬───────────────┘  ❌ opt.letter é undefined -> { letter: undefined }
                │
                ▼
┌───────────────────────────────┐  1. Badge: {option.letter} -> Círculo vazio/preto
│ src/components/               │  2. Click: handleSelectOption(undefined)
│ QuestionCard.tsx (L. 1718-61) │  3. Submit: if (!pendingSelected) return;
└───────────────┬───────────────┘  ⛔ BLOQUEIO TOTAL DA MARCAÇÃO PELO ALUNO
```

1. **Estrutura no Banco de Dados (`questions_curated_staging`)**:
   - **33.746 questões (13,28% do acervo)** possuem a coluna `options` preenchida no formato `LIST_OF_DICTS_NO_LETTER`.
   - Nelas, os objetos de alternativa foram salvos com chaves `id`, `text`, `index` (ou `choiceCount`), **sem a chave canônica `"letter"`**.
   - **Origem das questões afetadas:**
     - `questions_expansion_direto`: **26.428 questões**
     - `questions_expansion_direto` fundidas com `provaderesidencia_questoes`: **6.510 questões**
     - `questions_expansion_r_plus`: **478 questões**
     - `provaderesidencia_questoes`: **158 questões**
     - `questions_expansion_revalida`: **95 questões**
     - Outras combinações de expansão: **77 questões**

2. **Gargalo no Serviço de Dados ([`src/services/questionService.ts`](file:///d:/bancoresidencia/src/services/questionService.ts#L224-L226))**:
   ```typescript
   // Linhas 224-226:
   const cleanOptions = Array.isArray(row.options)
     ? row.options.map((opt) => ({ letter: opt.letter, text: opt.text }))
     : [];
   ```
   Como o objeto original não possui a chave `letter`, `opt.letter` resulta em `undefined`. O array final é repassado ao componente como `[{ letter: undefined, text: "..." }]`.

3. **Bloqueio no Componente Visual ([`src/components/QuestionCard.tsx`](file:///d:/bancoresidencia/src/components/QuestionCard.tsx#L1718-L1762))**:
   - **Exibição da Letra (L. 1761):** O elemento `<span className="..."> {option.letter} </span>` tenta renderizar `undefined`, resultando em um círculo vazio/escuro sem identificador.
   - **Disparo do Clique (L. 1719):** O evento `onClick={() => handleSelectOption(option.letter)}` invoca `handleSelectOption(undefined)`.
   - **Validação de Submissão (L. 1024):** No método `handleConfirmAnswer`, a validação `if (isAnswered || !pendingSelected || isSubmittingAnswer) return;` aborta imediatamente a submissão porque `pendingSelected` é `undefined`.

### 1.2. Integridade dos Gabaritos nessas 33.746 Questões
Das 33.746 questões com alternativas sem letra:
- **33.633 questões (99,67%)** possuem **gabarito homologado oficial ('A', 'B', 'C', 'D' ou 'E')** perfeitamente preservado na coluna `correct_answer`.
- Apenas **73** são anuladas, **27** estão sem gabarito e **13** têm anomalias de caracteres.
- **Validação de Índice:** Confirmamos por auditoria amostral que a propriedade `index` ou a posição ordinal do array (0, 1, 2, 3, 4) corresponde **rigorosamente** às letras ordinais (0 = A, 1 = B, 2 = C, 3 = D, 4 = E). O gabarito oficial bate perfeitamente com a assertiva correta na respectiva posição.

---

## 2. Censo Completo de Gabaritos da Base Canônica

O cruzamento de todos os registros da tabela [`questions_curated_staging`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db) revelou a seguinte distribuição exata:

| Categoria de Gabarito | Volume de Questões | % do Acervo | Descrição e Status |
| :--- | :--- | :--- | :--- |
| **Gabaritos Homologados Válidos (A-E)** | **236.783** | **93,15%** | Questões ativas com assertiva correta definitiva pronta para treino. |
| **Questões Anuladas** | **5.477** | **2,15%** | Anuladas pelas bancas examinadoras (`is_anulada = 1` ou `correct_answer = 'ANULADA'`). |
| **Sem Gabarito (Pendentes)** | **11.764** | **4,63%** | `correct_answer` nulo ou vazio; requerem cruzamento com cadernos oficiais na Frente 3. |
| **Anomalias Estruturais de Gabarito** | **168** | **0,07%** | Valores truncados ou errôneos inseridos na coluna de gabarito durante coletas legadas. |
| **TOTAL GERAL** | **254.192** | **100,00%** | **Consistência censitária exata (soma das partes = 254.192).** |

### 2.1. Distribuição dos Gabaritos Válidos (A até E)
A distribuição estatística entre as alternativas evidencia harmonia psicométrica esperada em bancos de residência médica de grande porte:
- **Alternativa A:** 57.102 questões (22,46% do total geral / 24,12% das homologadas)
- **Alternativa B:** 54.544 questões (21,46% do total geral / 23,04% das homologadas)
- **Alternativa C:** 54.078 questões (21,27% do total geral / 22,84% das homologadas)
- **Alternativa D:** 51.092 questões (20,10% do total geral / 21,58% das homologadas)
- **Alternativa E:** 20.436 questões (8,04% do total geral / 8,63% das homologadas) *(menor proporção decorrente de bancas que adotam apenas 4 alternativas A-D)*

### 2.2. Detalhamento das 168 Anomalias de Gabarito
1. **Gabarito `'!'` (156 questões)**:
   - Todas provenientes da base `questions_expansion_direto`.
   - Trata-se de ruído de scraping (caractere sentinela utilizado pela plataforma de origem para denotar questão sob recurso ou anulação não tratada).
2. **Gabaritos com Números de Caderno (12 questões)**:
   - Encontrados valores: `'38'` (2), `'39'` (2), `'40'` (2), `'7'` (1), `'8'` (1), `'9'` (1), `'10'` (1), `'37'` (1), `'95'` (1).
   - Provenientes de `questions_expansion_revalida` e `questions_expansion_direto`.
   - **Diagnóstico:** O scraper capturou o número da questão no caderno de provas impresso (ex: "Questão 38", "Questão 39") e injetou esse número na coluna `correct_answer` em vez da resposta. São, em sua maioria, questões discursivas do Revalida (ex: `EXP-REV-72235`, `EXP-REV-72234`).

---

## 3. Auditoria dos Filtros de Tipo (`type`): Múltipla Escolha vs. Discursiva

### 3.1. Panorama Declarado na Coluna `type`
- **`Múltipla escolha`**: **254.049 questões** (99,94%)
- **`Dissertativa`**: **143 questões** (0,06%)

### 3.2. Incoerências e Conflitos de Filtro Detectados

#### ❌ Incoerência 1: Conflito de Nomenclatura no Filtro de Discursivas (Frontend vs. Banco)
- **No Banco de Dados:** A coluna `type` armazena o valor `'Dissertativa'` (143 registros).
- **No Frontend e TypeScript ([`src/types/index.ts`](file:///d:/bancoresidencia/src/types/index.ts)):** O tipo aceito e exibido no dropdown de filtros é `'Discursiva'`:
  ```typescript
  export type QuestionType = 'Todas' | 'Múltipla escolha' | 'Discursiva' | 'Verdadeiro ou falso';
  ```
- **Na Consulta de Dados ([`src/services/questionService.ts`](file:///d:/bancoresidencia/src/services/questionService.ts#L747-L748)):**
  ```typescript
  if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
    query = query.eq('type', filters.tipoQuestao); // query.eq('type', 'Discursiva')
  }
  ```
- **Impacto:** Como nenhuma linha do banco possui `'Discursiva'` (está gravado `'Dissertativa'`), **o filtro "Discursiva" no front-end retorna invariavelmente ZERO questões**.

#### ❌ Incoerência 2: 5.463 Questões de Certo/Errado rotuladas como Múltipla Escolha
- Foram identificadas **5.463 questões** cujo array de alternativas possui exatamente 2 elementos:
  `[{"text": "Certo.", "letter": "A"}, {"text": "Errado.", "letter": "B"}]`.
- **Bancas predominantes:** SES-DF (2.439 questões), UnB/HUB (2.100 questões), HFA, HSL Brasília.
- **Problema:** Essas questões estão cadastradas com `type = 'Múltipla escolha'`. Se o aluno seleciona no filtro a opção `'Verdadeiro ou falso'`, o sistema busca `type = 'Verdadeiro ou falso'` e **não encontra nenhuma questão**, ignorando as 5.463 questões legítimas desse formato.

#### ❌ Incoerência 3: 1.244 Questões Discursivas mascaradas com 1 Única Alternativa
- Foram encontradas **1.244 questões** com `type = 'Múltipla escolha'`, mas cujo JSON de alternativas contém apenas 1 item.
- Ao inspecionar o conteúdo desse item único, verifica-se que ele contém o espelho de correção discursivo:
  - Exemplo 1: `[{"text": "GABARITO NÃO DISPONIBILIZADO PELA BANCA.", "letter": "A"}]`
  - Exemplo 2: `[{"text": "GABARITO: O RN é prematuro, portanto deve receber os PASSOS INICIAIS: 1. Prover calor...", "letter": "A"}]`
- **Bancas afetadas:** UNIFESP, USP, FAMEMA, SUS-BA.
- **Diagnóstico:** São questões originalmente **Discursivas/Prático-Orais**. O scraper injetou o espelho da banca dentro de `options` fingindo ser uma alternativa 'A'.

#### ❌ Incoerência 4: 1.615 Questões com `type = 'Múltipla escolha'` sem Alternativas
- **1.615 questões** possuem `options` nulo ou vazio (`[]`, `null`, `""`).
- **Composição desse grupo:**
  - **1.128 questões (69,8%)** são questões **ANULADAS** pela banca examinadora (o scraper não capturou assertivas porque a banca cancelou o item no caderno definitivo).
  - **155 questões** possuem `correct_answer = '!'`.
  - **192 questões** possuem `correct_answer = NULL`.
  - **140 questões** possuem gabarito 'A'-'E', mas suas alternativas foram perdidas na extração de origem.

---

## 4. Auditoria de Comentários e Cobertura do Padrão-Ouro

### 4.1. Panorama Global de Comentários Médicos
- **Questões com Comentário:** **151.143 questões (59,46%)**
- **Questões Sem Comentário:** **103.049 questões (40,54%)**

```
                       DISTRIBUIÇÃO DOS COMENTÁRIOS NO ACERVO
┌────────────────────────────────────────────────────────┬─────────────────────────┐
│ Categoria Pedagógica                                   │ Volume de Questões      │
├────────────────────────────────────────────────────────┼─────────────────────────┤
│ 🏆 Padrão-Ouro Completo (Justif. + Take-Home + Resumo) │   5.422 (2,13%)         │
│ 📌 Com Take-Home Message ou Pérola do Preceptor        │  81.139 (31,92%)        │
│ 📝 Com Justificativa Assertiva por Assertiva           │  36.551 (14,38%)        │
│ ⚠️ Com Destaque de Armadilha / Principal Erro         │   4.331 (1,70%)         │
│ 📄 Comentários Legados / Texto Corrido                 │ 111.241 (43,76%)        │
│ ⚡ Comentários Curtos (< 150 caracteres)               │  34.480 (13,56%)        │
│ ❌ Totalmente Sem Comentário                          │ 103.049 (40,54%)        │
└────────────────────────────────────────────────────────┴─────────────────────────┘
```

### 4.2. Matriz de Cobertura por Especialidade Médica

A análise cruzada entre Especialidades, Gabaritos Homologados e Qualidade de Comentário revelou:

| Especialidade | Total de Questões | Homologadas (A-E) | Com Comentário | Padrão-Ouro Completo | % Ouro sobre Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clínica Médica** | 99.589 | 93.825 | 42.652 | 1.940 | 1,95% |
| **Não definida** *(a classificar)* | 30.599 | 30.312 | 30.312 | 0 | 0,00% |
| **Pediatria** | 29.918 | 27.109 | 23.363 | 1.448 | 4,84% |
| **Medicina Preventiva e Social** | 27.383 | 24.568 | 8.433 | 4 | 0,01% |
| **Cirurgia** | 20.173 | 17.328 | 7.961 | 258 | 1,28% |
| **Obstetrícia** | 17.864 | 16.070 | 15.698 | 861 | 4,82% |
| **Ginecologia** | 16.053 | 15.523 | 15.579 | 898 | 5,59% |
| **Cirurgia Geral** | 8.815 | 8.726 | 7.094 | 13 | 0,15% |
| **Não classificada** | 3.771 | 3.764 | 33 | 0 | 0,00% |
| **Variações de Grafia (Preventiva, etc.)** | 27 | 27 | 18 | 0 | 0,00% |
| **TOTAL** | **254.192** | **236.783** | **151.143** | **5.422** | **2,13%** |

> [!NOTE]
> Observa-se que **Ginecologia (5,59%)**, **Pediatria (4,84%)** e **Obstetrícia (4,82%)** são as áreas com maior proporção relativa de comentários Padrão-Ouro consolidados, fruto de campanhas anteriores de geração médica de alta densidade.
> Em contrapartida, **Medicina Preventiva e Social** e **Cirurgia Geral** apresentam grande volume de comentários legados não estruturados, demandando a atuação da Frente 4 de Comentários Médicos via API Ouro.

---

## 5. Auditoria dos Filtros Taxonômicos e Metadados do Sistema

| Campo do Filtro | Preenchidos | % Preenchimento | Status de Integridade |
| :--- | :--- | :--- | :--- |
| **`institution`** | 254.192 | 100,00% | Totalmente íntegro na SSOT |
| **`banca`** | 254.192 | 100,00% | Totalmente íntegro na SSOT |
| **`year`** | 254.190 | 99,99% | Apenas 2 registros sem ano |
| **`difficulty`** | 254.192 | 100,00% | 100% preenchido (calibração TRI pendente na Frente 6) |
| **`especialidade`** | 223.593 | 87,96% | 30.599 sem classificação ("Não definida") |
| **`tema`** | 223.593 | 87,96% | 30.599 sem classificação ("Não definida") |
| **`foco`** | 223.593 | 87,96% | 30.599 sem classificação ("Não definida") |
| **`subfoco`** | 223.593 | 87,96% | 30.599 sem classificação ("Não definida") |

---

## 6. Quadro Sinóptico de Incoerências e Diagnósticos de Erro

| Código | Descrição do Problema | Volume Afetado | Localização do Erro | Impacto Prático no Aluno / Plataforma |
| :---: | :--- | :---: | :--- | :--- |
| **ERR-01** | Alternativas sem propriedade `letter` no JSON de `options` | **33.746 questões** | Banco (`questions_curated_staging`) + `questionService.ts` | **Severo:** Letras não aparecem nos círculos e o aluno não consegue marcar nem enviar a resolução. |
| **ERR-02** | Filtro de Discursivas com divergência de string (`Discursiva` vs `Dissertativa`) | **143 questões** | Frontend (`types/index.ts`) vs Banco (`type`) | **Alto:** Ao filtrar por questões discursivas, o sistema retorna 0 resultados. |
| **ERR-03** | Questões Certo/Errado (2 alternativas) com `type = 'Múltipla escolha'` | **5.463 questões** | Banco (`questions_curated_staging`) | **Médio:** Filtro de "Verdadeiro ou Falso" não encontra as questões de CESPE/SES-DF/UnB. |
| **ERR-04** | Questões Discursivas com espelho injetado como 1 alternativa em `options` | **1.244 questões** | Banco (`questions_curated_staging`) | **Médio:** Questões discursivas aparecem na esteira de múltipla escolha com texto de gabarito como assertiva única A. |
| **ERR-05** | Questões de Múltipla Escolha com `options` vazias/nulas | **1.615 questões** | Banco (`questions_curated_staging`) | **Médio:** Questões aparecem sem opções na tela (1.128 são anuladas e devem ser tratadas como tal). |
| **ERR-06** | Gabaritos anômalos (`'!'` ou número de questão) | **168 questões** | Coluna `correct_answer` | **Baixo:** 156 questões com `'!'` e 12 com número da questão impresso no caderno. |
| **ERR-07** | Questões sem gabarito cadastrado na SSOT | **11.764 questões** | Coluna `correct_answer` IS NULL | **Estratégico:** Escopo central de trabalho da próxima Frente 3 de Gabaritos. |
| **ERR-08** | Variações de grafia em especialidades (`Preventiva`, `ClinicaMedica`, etc.) | **27 questões** | Coluna `especialidade` | **Baixo:** Pequenas inconsistências taxonômicas a serem unificadas na Frente 6. |

---

## 7. Próximos Passos Recomendados para Alinhamento com o Usuário

Conforme solicitado explicitamente, **nenhum plano de execução ou alteração em banco/código foi iniciado neste turno**. 

Para as etapas subsequentes, ficam evidenciadas duas vias essenciais de atuação:
1. **Solução Imediata de Engenharia no Frontend/Serviço (Hotfix Rápido e Seguro)**:
   - Adicionar no mapeador de [`src/services/questionService.ts`](file:///d:/bancoresidencia/src/services/questionService.ts#L224-L226) e no [`QuestionCard.tsx`](file:///d:/bancoresidencia/src/components/QuestionCard.tsx) a inferência defensiva da letra a partir do índice posicional: `opt.letter || ['A', 'B', 'C', 'D', 'E'][index]`.
   - Isso desbloqueia imediatamente as **33.746 questões** para os alunos na interface, permitindo marcar e resolver normalmente enquanto a base física é saneada.
2. **Saneamento Definitivo na SSOT (`questions_curated_staging`) via Frentes 2 e 3**:
   - Injetar deterministicamente a chave `"letter": "A"|"B"|"C"|"D"|"E"` diretamente nos JSONs da coluna `options` das 33.746 questões.
   - Normalizar os 168 gabaritos anômalos (`!` e números).
   - Ajustar o campo `type` para `'Discursiva'` (unificando com o filtro) e `'Verdadeiro ou falso'` para as 5.463 questões de Certo/Errado.
   - Tratar na **Frente 3** a busca dos cadernos oficiais para as **11.764 questões sem gabarito**.
