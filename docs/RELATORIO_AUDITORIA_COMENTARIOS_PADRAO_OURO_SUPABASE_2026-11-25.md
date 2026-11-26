# Relatório Absoluto de Auditoria: Comentários Padrão-Ouro & Classificação no Supabase

**Data da Auditoria:** 25 de novembro de 2026  
**Modo de Execução:** Somente leitura (varredura integral via keyset pagination diretamente nas tabelas vivas do Supabase)  
**Escopo Auditado:** 100% das **257.090** questões das 4 tabelas canônicas (`questions_direto`, `questions_rplus`, `questions_revalida`, `questions_titulo`) e 100% dos **246.257** registros do índice de estudo (`study_question_index`).  
**Objetivo do Documento:** Fornecer o diagnóstico exato e auditável de todas as questões comentadas, não comentadas, corretamente classificadas e erroneamente classificadas (Falsos Positivos, Falsos Negativos e dessincronias), incluindo subgrupos de discursivas e com imagem, para servir de base técnica à definição do **Selo Absoluto** e do filtro definitivo para os alunos.

---

## 1. Critério Canônico de "Comentário Padrão-Ouro" (4 Pilares Obrigatórios)

Para uma questão ser considerada **Padrão-Ouro** na plataforma (alinhada ao protocolo [`professor-questoes-medicas`](file:///d:/bancoresidencia/.agents/skills/professor-questoes-medicas/SKILL.md) e ao parser de renderização de [`QuestionCard.tsx`](file:///d:/bancoresidencia/src/components/QuestionCard.tsx#L845-L987)), ela deve possuir **simultaneamente (`AND`)** todos os 4 componentes abaixo, sem placeholders, sem HTML residual, sem JSON bruto e sem saudações legadas:

| Pilar | Regra para Questões Objetivas (`Múltipla escolha` / `Certo ou errado`) | Regra para Questões Discursivas / Dissertativas (ou sem opções) |
| :--- | :--- | :--- |
| **1. Justificativa** | Explicação individual não trivial ($\ge 10$ caracteres e não genérica) para **100% das alternativas** (em `options[].explanation` ou no bloco `Análise das Alternativas` em `commentary`). | Espelho/Padrão de Resposta comentado ou fundamentação clínica substantiva ($\ge 80$ caracteres) em `commentary`. |
| **2. Comentário Final** | Síntese clínica conclusiva não vazia ($\ge 40$ caracteres após extrair blocos auxiliares), livre de saudações legadas (`Olá, estudante!`, `Estrategista`, `MEDOPEN`). | Síntese clínica conclusiva não vazia ($\ge 40$ caracteres após extrair blocos auxiliares). |
| **3. Take-Home Message** | Bloco `Take-Home Message` / `Pérola Prática` / `Pérola Clínica` reconhecido pelo parser do `QuestionCard.tsx` ($\ge 10$ caracteres). | Bloco `Take-Home Message` / `Pérola Prática` / `Pérola Clínica` reconhecido pelo parser do `QuestionCard.tsx` ($\ge 10$ caracteres). |
| **4. Principal Motivo de Erro** | Bloco `Principal Motivo de Erro` / `Armadilha da Questão` / `Motivo de Erro` reconhecido pelo parser do `QuestionCard.tsx` ($\ge 10$ caracteres). | Bloco `Principal Motivo de Erro` / `Armadilha da Questão` / `Motivo de Erro` reconhecido pelo parser do `QuestionCard.tsx` ($\ge 10$ caracteres). |

---

## 2. Mapa das Fontes no Supabase & Dois Mecanismos Divergentes

A auditoria constatou que o Supabase mantém **dois sistemas independentes e dessincronizados** para representar se uma questão é comentada / Padrão-Ouro, além de um terceiro filtro legado de fallback:

1. **Filtro do Aluno (`study_question_index.has_gold_commentary`):**
   - Utilizado pela RPC [`query_study_questions`](file:///d:/bancoresidencia/supabase/migrations/20261125022656_add_gold_commentary_filter_to_study_catalog.sql#L183-L359) quando o filtro **Comentadas** (`apenasComentadas = true`, ativo **por padrão** em [`QuestoesView.tsx`](file:///d:/bancoresidencia/src/components/QuestoesView.tsx#L81)) está ligado.
   - Indexa apenas questões com `has_gabarito = true` (**246.257** questões).
   - Calculado pela função SQL [`public.is_gold_standard_commentary(text, jsonb)`](file:///d:/bancoresidencia/supabase/migrations/20261125022656_add_gold_commentary_filter_to_study_catalog.sql#L8-L64).
2. **Selo nas Tabelas Canônicas (`commentary_tier` e `study_gold_fingerprint`):**
   - Colunas presentes nas 4 tabelas canônicas (`questions_direto`, `questions_rplus`, `questions_revalida`, `questions_titulo`).
   - `commentary_tier = 'padrao_ouro'` soma **180.068** registros, enquanto `study_gold_fingerprint` (hash SHA-256 definido em [`20261120043255_enforce_gold_study_catalog.sql`](file:///d:/bancoresidencia/supabase/migrations/20261120043255_enforce_gold_study_catalog.sql#L17-L25)) está preenchido em apenas **134.219** registros.
3. **Filtro Legado de Fallback (`/api/questions`):**
   - [`applyQuestionFilters`](file:///d:/bancoresidencia/src/app/api/questions/route.ts#L555-L559) ainda filtra por `commentary.ilike.%Take-Home%` etc. para chamadas privilegiadas que não passam pela RPC `query_study_questions`.

> **Nota sobre tabelas legadas:** As tabelas `questions` (**130.024** linhas, sendo **120.510** com `commentary` não vazio) e `questions_expansion_*` (`direto`: 47.877; `r_plus`: 43.979; `revalida`: 1.437; `titulo`: 692) permanecem no banco como histórico/backup, mas não alimentam `study_question_catalog`, `study_question_index` nem as views públicas (`view_questions_*`).

---

## 3. Diagnóstico Global do Acervo Canônico (257.090 Questões)

### 3.1. Presença Real dos 4 Pilares

| Classificação Real (Ground Truth) | Quantidade | % do Total (257.090) | Com Gabarito (`study_question_index`) | Sem Gabarito (Fora do Índice) |
| :--- | ---: | ---: | ---: | ---: |
| **Padrão-Ouro Completo (todos os 4 pilares válidos)** | **150.543** | **58,56%** | **149.008** | **1.535** |
| Padrão-Ouro Quase-Completo (parcial nas opções: `1/4` ou `2/4`) | **4** | **0,00%** | **4** | **0** |
| **Comentadas Incompletas (falta ≥ 1 pilar)** | **45.234** | **17,59%** | **44.524** | **710** |
| **Sem Comentário** *(inclui 151 com explicação só em `options[]` e `commentary = ""`)* | **61.309** | **23,85%** | **52.721** | **8.588** |
| **TOTAL CANÔNICO** | **257.090** | **100,00%** | **246.257** | **10.833** |

#### Cobertura Individual por Pilar (sobre 257.090 questões)
- **Pilar 1 — Justificativa completa (100% das alternativas ou discursiva válida):** `151.473` (`58,92%`) | Parcial: `5` | Ausente: `105.612` (`41,08%`)
- **Pilar 2 — Comentário Final / Síntese Clínica:** `195.767` (`76,15%`) | Ausente: `61.323` (`23,85%`)
- **Pilar 3 — Take-Home Message (parser `QuestionCard.tsx`):** `195.079` (`75,88%`) | Apenas formato com prefixo `💡` / fora do regex do parser: `669` (`0,26%`) | Ausente: `61.342` (`23,86%`)
- **Pilar 4 — Principal Motivo de Erro (parser `QuestionCard.tsx`):** `194.987` (`75,84%`) | Ausente: `62.103` (`24,16%`)

> **Ressalva Metodológica Auditada (6 registros):** Existem exatamente **6** questões em `questions_direto` (`HMG-2017-CIR-10405`, `UFGHC-2016-URO-465`, `CMC-2018-CIR-16828`, `CERMAM-2018-CIR-18054`, `UFMAHUUFMA-2017-CIR-15772`, `UNIVERSIDADE-2017-CIR-4244`) que começam com o cabeçalho `"Gabarito Oficial: Alternativa X.\n\nResumo Clínico e Diagnóstico:..."` seguido do bloco `Análise das Alternativas:` dentro de `commentary`. Por iniciarem com `Gabarito Oficial`, o classificador automático as sinalizou inicialmente como placeholder (`placeholder = 6`), mas a inspeção direta do texto confirmou que possuem conteúdo clínico real (não há placeholders estáticos reais como `"Gabarito não disponibilizado"` no acervo). Contudo, **2 delas** (`HMG-2017-CIR-10405` e `CERMAM-2018-CIR-18054`) apresentam **divergência grave entre o texto do comentário (`Alternativa A`) e o gabarito oficial do banco (`C` e `B`)**.

---

## 4. Matrizes de Confusão: Corretas vs. Erroneamente Classificadas

### 4.1. Sistema A — Filtro do Aluno (`study_question_index.has_gold_commentary`, N = 246.257)

| Status Real \ Classificação no Índice | `has_gold_commentary = TRUE` (Exibida em "Comentadas") | `has_gold_commentary = FALSE` (Oculta em "Comentadas") | Total Indexado |
| :--- | ---: | ---: | ---: |
| **É Padrão-Ouro (4 pilares)** | **149.008** *(Verdadeiro Positivo)* | **0** *(Falso Negativo)* | **149.008** |
| **NÃO é Padrão-Ouro** | **44.670** *(Falso Positivo)* | **52.579** *(Verdadeiro Negativo)* | **97.249** |
| **Total em `study_question_index`** | **193.678** (`78,65%`) | **52.579** (`21,35%`) | **246.257** |

- **Classificadas Corretamente (`VP + VN`):** **201.587** (`81,86%`)
- **Classificadas Erroneamente (`FP + FN`):** **44.670** (`18,14%`)
- **Impacto direto para o usuário:** Quase **1 em cada 4 questões (`23,06%`)** entregues pelo filtro padrão **"Comentadas"** (`44.670` de `193.678`) **NÃO é Padrão-Ouro**!

#### Raio-X dos 44.670 Falsos Positivos em `has_gold_commentary = TRUE`
*(Nota: uma mesma questão pode acumular mais de uma falha.)*
1. **Sem Justificativa das Alternativas (`0/N` ou incompleta):** **43.741** (`97,9%` dos FPs) — possuem Comentário Final + Take-Home + Principal Erro, mas `options[].explanation` está vazio e não há bloco `Análise das Alternativas` em `commentary`.
2. **Sem Principal Motivo de Erro:** **935** questões (inclui `661` do Revalida + `243` do Direto + `17` do R+ + `14` com apenas `options[].explanation`).
3. **Sem Take-Home Message reconhecido pelo parser:** **844** questões:
   - **669** possuem Take-Home com prefixo de emoji `💡 **Take-Home Message:**` ou formato não reconhecido pelo regex de `QuestionCard.tsx` (`661` no Revalida + `8` no Direto).
   - **175** não possuem Take-Home algum.
4. **Sem Comentário Final (`commentary` vazio ou ausente):** **167** questões — destaque para **151** questões em que `commentary = ""` e `options[].explanation` foi preenchido, passando indevidamente pela regra das linhas 52–60 de `is_gold_standard_commentary`.
5. **Saudações legadas de cursinhos (`"Olá, estudante!"` + tags `<br>`):** **17** questões em `questions_rplus`, sem Take-Home e sem Principal Erro.

---

### 4.2. Sistema B — Selo na Tabela Canônica (`commentary_tier = 'padrao_ouro'`, N = 257.090)

| Status Real \ Selo na Tabela | `commentary_tier = 'padrao_ouro'` | `commentary_tier IS NULL` | Total Canônico |
| :--- | ---: | ---: | ---: |
| **É Padrão-Ouro (4 pilares)** | **135.557** *(Verdadeiro Positivo)* | **14.986** *(Falso Negativo)* | **150.543** |
| **NÃO é Padrão-Ouro** | **44.511** *(Falso Positivo)* | **62.036** *(Verdadeiro Negativo)* | **106.547** |
| **Total nas 4 Tabelas** | **180.068** (`70,04%`) | **77.022** (`29,96%`) | **257.090** |

- **Classificadas Corretamente (`VP + VN`):** **197.593** (`76,86%`)
- **Classificadas Erroneamente (`FP + FN`):** **59.497** (`23,14%`), sendo:
  - **44.511 Falsos Positivos:** possuem o selo `padrao_ouro`, mas **44.499** não têm justificativa das alternativas, **562** não têm Principal Motivo de Erro, **551** não têm Take-Home e **552** não têm Comentário Final (incluindo a questão discursiva `bc3d62c5-02cd-53ff-be44-4217bda629c9`, com `commentary = NULL` e selo + `study_gold_fingerprint` preenchidos).
  - **14.986 Falsos Negativos:** possuem **todos os 4 pilares completos**, mas estão sem o selo (`commentary_tier IS NULL`). Dessas, **13.601** têm `has_gabarito = true` (estão no catálogo!) e **1.385** têm `has_gabarito = false`.

### 4.3. Dessincronia Direta entre Tabela (`commentary_tier`) e Índice (`has_gold_commentary`)

| Tipo de Dessincronia | Quantidade | Impacto |
| :--- | ---: | :--- |
| `commentary_tier = 'padrao_ouro'` **mas** `has_gold_commentary = FALSE` | **544** | Selo diz "Padrão Ouro", mas filtro do aluno oculta a questão. |
| `commentary_tier IS NULL` **mas** `has_gold_commentary = TRUE` | **14.586** | Filtro do aluno exibe a questão, mas a tabela-base não tem selo (`11.222` no Direto, `3.347` no Revalida, `17` no R+). |
| `commentary_tier = 'padrao_ouro'` **mas** fora de `study_question_index` (`has_gabarito = false`) | **432** | Selo atribuído a questão sem gabarito oficial homologado (`150` Ouro real, `282` incompletas). |
| `commentary_tier = 'padrao_ouro'` **sem** `study_gold_fingerprint` | **45.849** | `180.068` com selo vs. `134.219` com fingerprint SHA-256. |

---

## 5. Análise Detalhada por Tabela Canônica

| Tabela (Modalidade) | Total | Com Gabarito | Sem Gabarito | Padrão-Ouro Real (4 Pilares) | Comentada Incompleta | Sem Comentário | Índice `has_gold = TRUE` | Índice VP / FP / FN | Selo `padrao_ouro` | Selo VP / FP / FN |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **`questions_direto`** (Acesso Direto) | **206.578** | 196.387 | 10.191 | **147.796** (`71,5%`) | **44.132** | **14.648** | **189.836** | 146.282 / **43.554** / 0 | **179.581** | 135.501 / **44.080** / **12.295** |
| **`questions_rplus`** (R+) | **45.413** | 45.106 | 307 | **49** (`0,11%`) | **424** | **44.940** | **471** | 49 / **422** / 0 | **463** | 49 / **414** / 0 |
| **`questions_revalida`** (Revalida) | **4.411** | 4.076 | 335 | **2.698** (`61,2%`) | **678** | **1.033** | **3.371** | 2.677 / **694** / 0 | **24** | 7 / **17** / **2.691** |
| **`questions_titulo`** (Título Esp.) | **688** | 688 | 0 | **0** (`0,0%`) | **0** | **688** | **0** | 0 / 0 / 0 | **0** | 0 / 0 / 0 |
| **TOTAL** | **257.090** | **246.257** | **10.833** | **150.543** | **45.234** | **61.309** | **193.678** | **149.008 / 44.670 / 0** | **180.068** | **135.557 / 44.511 / 14.986** |

*(Observação: `+2` questões no Direto e `+2` no Revalida têm justificativa parcial `1/4` ou `2/4` nas alternativas e completam o total.)*

### Destaques por Tabela
- **`questions_direto`:** Concentra **98,18%** de todo o acervo Padrão-Ouro real (`147.796`), mas também concentra **97,50%** de todos os Falsos Positivos do filtro (`43.554`, quase todos pela ausência de `options[].explanation`). Além disso, **12.295** questões 100% Padrão-Ouro estão com `commentary_tier IS NULL`.
- **`questions_rplus`:** De **471** questões liberadas pelo filtro do aluno, apenas **49** (`10,4%`) são realmente Padrão-Ouro; **405** não têm justificativa das alternativas e **17** são comentários legados com `"Olá, estudante!"` e tags `<br>` (sem Take-Home nem Principal Erro).
- **`questions_revalida`:** **99,1%** das questões Padrão-Ouro reais (`2.691` de `2.698`) estão com `commentary_tier IS NULL` na tabela! E **661** questões (`490` objetivas + `171` discursivas) usam o padrão `💡 **Take-Home Message:**` **sem** `Principal Motivo de Erro`, passando erroneamente no filtro como `has_gold_commentary = true` (além de o prefixo `💡 ` quebrar o parser do `QuestionCard.tsx`). Foram também detectadas **2** questões objetivas no Revalida com alternativas duplicadas no array JSONB (`8` opções: `A–D` repetidas duas vezes, ex.: `EXP-REV-180644` e `EXP-REV-180628`).
- **`questions_titulo`:** 100% sem comentário (**688** de **688**) e 100% corretamente classificadas como `false` / `NULL`.

---

## 6. Subgrupos Críticos de Análise (Discursivas, Com Imagem, Anuladas e Formatos)

### 6.1. Matriz Cruzada: Formato × Presença de Imagem

| Subgrupo | Total | Com Gabarito | Padrão-Ouro Real | Incompletas | Sem Comentário | Índice `has_gold = TRUE` | Índice VP / FP / FN | Selo `padrao_ouro` | Selo VP / FP / FN |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **1. Objetivas — Sem Imagem** | **248.399** | 238.200 | **147.239** (`59,3%`) | **43.938** | **57.218** | **188.959** | 145.712 / **43.247** / 0 | **175.690** | 132.363 / **43.327** / **14.876** |
| **2. Objetivas — Com Imagem** | **7.069** | 6.483 | **3.159** (`44,7%`) | **1.125** | **2.785** | **4.408** | 3.156 / **1.252** / 0 | **4.281** | 3.098 / **1.183** / **61** |
| **3. Discursivas — Sem Imagem** | **1.559** | 1.518 | **143** (`9,2%`) | **171** | **1.245** | **309** | 138 / **171** / 0 | **97** | 96 / **1** / **47** |
| **4. Discursivas — Com Imagem** | **63** | 56 | **2** (`3,2%`) | **0** | **61** | **2** | 2 / **0** / 0 | **0** | 0 / **0** / **2** |
| **TOTAL** | **257.090** | **246.257** | **150.543** | **45.234** | **61.309** | **193.678** | **149.008 / 44.670 / 0** | **180.068** | **135.557 / 44.511 / 14.986** |

*(Os `+4` casos de `trueGoldBroadExtra` estão em `Objetivas — Sem Imagem`.)*

### 6.2. Subgrupo Discursivas / Dissertativas (`1.622` questões)

Distribuição por tabela:
- `questions_direto`: **728** discursivas (`99` com comentário Padrão-Ouro completo em formato de prosa clínica + Principal Erro + Take-Home, sem cabeçalho explícito `"Padrão de Resposta"`; `629` sem comentário).
- `questions_rplus`: **540** discursivas (**0** comentadas, `0` com imagem, `0` com selo).
- `questions_revalida`: **354** discursivas (`50` com imagem; `217` comentadas; `137` sem comentário):
  - **46** possuem os 4 pilares completos (`Padrão de Resposta Comentado` + `Síntese Clínica` + `Principal Motivo de Erro` + `Take-Home Message`), sendo todas sem imagem (no `Direto` estão as **2** discursivas com imagem que são Padrão-Ouro).
  - **171** possuem `**Padrão de Resposta Comentado:**`, `**Síntese Clínica:**` e `💡 **Take-Home Message:**`, porém **0** delas possui `Principal Motivo de Erro`, e o prefixo `💡 ` impede que `QuestionCard.tsx` extraia o card de Take-Home! Todas as **171** estão hoje marcadas como `has_gold_commentary = TRUE` (**100% Falso Positivo no Revalida Discursivas**).
- `questions_titulo`: **0** discursivas.

**Achados Críticos Específicos de Discursivas:**
1. **Falso Positivo Fantasma (`commentary = NULL` com selo + fingerprint):** A questão `bc3d62c5-02cd-53ff-be44-4217bda629c9` (`EXP-DIR-23246`, `Dissertativa`) está com `commentary = null` e `options = []`, mas mantém `commentary_tier = 'padrao_ouro'` e `study_gold_fingerprint` preenchido.
2. **Discursivas com `is_anulada = true` / `correct_answer = 'ANULADA'`:** **198** discursivas (ex.: `UEPAREVALIDA-2023-PED-24004`, `UFMTREVALIDA-2019-OBS-13921`, `UERJHUPE-2020-GIN-2907`) estão marcadas como `ANULADA` no banco, apesar de possuírem padrão de resposta discursivo válido.
3. **Ausência de `Principal Motivo de Erro` + `💡` no Revalida:** `171` discursivas comentadas falham apenas por esse padrão incompleto de geração.
4. **Discursivas com Imagem (`63`):** Apenas **2** (`3,17%`) são Padrão-Ouro (ambas no Direto, e ambas estão com `commentary_tier = NULL`); **61** (`96,83%`) estão totalmente sem comentário.

### 6.3. Subgrupo Questões com Imagem (`7.132` questões: `7.069` Objetivas + `63` Discursivas)

- Total com imagem: **7.132** (`6.733` Direto | `123` R+ | `276` Revalida | `0` Título).
- Com gabarito homologado: **6.539** (`6.483` objetivas + `56` discursivas).
- **Padrão-Ouro Real (4 pilares):** **3.161** (`3.159` objetivas + `2` discursivas = **44,32%**).
- **Falsos Positivos no Filtro (`has_gold_commentary = TRUE`):** **1.252** questões objetivas com imagem (**28,4%** de todas as questões com imagem entregues pelo filtro "Comentadas"!):
  - **1.108** possuem `commentary` (Síntese + Take-Home + Principal Erro), mas **zero** justificativa nas alternativas (`options[].explanation` vazio).
  - **144** possuem **APENAS** `options[].explanation` (ricas explicações por alternativa), porém com `commentary = ""` (sem Comentário Final, sem Take-Home, sem Principal Erro)! — Exemplos: `UFRGSHCPA-2015-GIN-1668`, `HEDA-2022-CLM-13771`, `USPHCFMUSP-2025-OBS-5860`. Isso ocorre porque a cláusula final de `is_gold_standard_commentary` aprova qualquer questão em que 1 alternativa tenha `explanation > 15 chars` com `**`.
- **Falsos Negativos no Selo `commentary_tier`:** **63** questões com imagem (`61` objetivas + `2` discursivas) são Padrão-Ouro completo, mas têm `commentary_tier = NULL`.

### 6.4. Outros Subgrupos Relevantes

| Subgrupo | Total | Padrão-Ouro Real | Incompletas | Sem Comentário | Principais Achados |
| :--- | ---: | ---: | ---: | ---: | :--- |
| **Anuladas (`is_anulada` / `ANULADA`)** | **6.011** | **4.595** (`76,4%`) | **562** | **854** | `575` Falsos Positivos no índice (`428` sem justificativa, `142` sem Take-Home, `147` sem Principal Erro); `1.326` objetivas anuladas estão com `options = []`. |
| **Objetivas sem Opções (`options = []`)** | **1.663** | — | — | — | `1.326` são anuladas e **`337` não são anuladas** (estão com `has_gabarito = false`, ex.: `SUSBA-2017-CIR-4689`). |
| **Certo ou Errado (`5.463`)** | **5.463** | *(maioria no Direto)* | — | — | `3.582` no Direto (maioria com `options[].explanation` nas 2 opções Certo/Errado + 4 pilares) e `1.881` no R+ (muitas com `commentary` sem `options[].explanation`). |
| **Sem Gabarito (`has_gabarito = false`)** | **10.833** | **1.535** (`14,2%`) | **710** | **8.588** | `1.535` já têm comentário Padrão-Ouro completo, mas ficam fora do catálogo por não terem `has_gabarito = true`; `432` têm `commentary_tier = 'padrao_ouro'` na tabela. |
| **Tags HTML Residuais (`<p>`, `<br>`, `<u>`)** | **174** | — | — | — | `111` no Direto, `59` no R+, `4` no Revalida. |

---

## 7. Distribuição por Especialidade Médica

| Especialidade | Total | Com Gabarito | Padrão-Ouro Real | Incompletas | Índice `has_gold = TRUE` | Índice VP / FP / FN | Selo VP / FP / FN |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Clínica Médica** | **89.197** | 85.850 | **50.934** (`57,1%`) | 11.317 | **61.458** | 50.231 / **11.227** / 0 | 40.572 / **11.226** / **10.362** |
| **Cirurgia Geral** | **45.562** | 43.301 | **18.696** (`41,0%`) | 9.821 | **28.398** | 18.619 / **9.779** / 0 | 18.104 / **9.807** / **592** |
| **Pediatria** | **43.354** | 41.232 | **28.828** (`66,5%`) | 7.960 | **36.268** | 28.757 / **7.511** / 0 | 26.614 / **7.299** / **2.214** |
| **Medicina Preventiva e Social** | **31.356** | 29.622 | **18.676** (`59,6%`) | 9.188 | **27.456** | 18.295 / **9.161** / 0 | 18.181 / **9.126** / **495** |
| **Obstetrícia** | **26.646** | 25.397 | **17.356** (`65,1%`) | 4.419 | **21.472** | 17.065 / **4.407** / 0 | 16.544 / **4.508** / **812** |
| **Ginecologia** | **20.975** | 20.855 | **16.053** (`76,5%`) | 2.529 | **18.626** | 16.041 / **2.585** / 0 | 15.542 / **2.545** / **511** |
| **TOTAL** | **257.090** | **246.257** | **150.543** | **45.234** | **193.678** | **149.008 / 44.670 / 0** | **135.557 / 44.511 / 14.986** |

---

## 8. Diagnóstico das Causas-Raiz Técnicas

1. **Função SQL `is_gold_standard_commentary` excessivamente permissiva (`OR` em vez de `AND`):**
   - Definida em [`20261125022656_add_gold_commentary_filter_to_study_catalog.sql`](file:///d:/bancoresidencia/supabase/migrations/20261125022656_add_gold_commentary_filter_to_study_catalog.sql#L8-L64).
   - Aprova qualquer questão que contenha **qualquer um** dos termos (`Take-Home`, `Síntese Clínica`, `Armadilha da Questão`, `Pérola Clínica`, `💡`) ou **uma única alternativa** com `**` no campo `explanation`, sem exigir conjuntamente Justificativa + Comentário Final + Take-Home + Principal Motivo de Erro, e sem distinguir questões objetivas de discursivas.
2. **Critério legado que gerou `commentary_tier = 'padrao_ouro'`:**
   - Scripts de enriquecimento anteriores (ex.: [`classify_and_enrich_257k_v3.py`](file:///d:/bancoresidencia/scripts/classify_and_enrich_257k_v3.py#L187-L194)) atribuíram `padrao_ouro` com base em tamanho de texto (`> 350` chars) e presença isolada de `take-home` ou `**`, carimbando **44.511** questões sem os 4 pilares (principalmente sem justificativa das alternativas) e deixando **14.986** questões completas sem selo.
3. **Ausência de `options[].explanation` em 44.443 questões com corpo completo:**
   - Um lote massivo (principalmente `EXP-DIR-*`, `pdr_*` e questões de `Cirurgia Geral`, `Clínica Médica` e `Preventiva`) foi gerado com `Comentário Final + Principal Motivo de Erro + Take-Home Message`, mas sem popular `options[].explanation` nem incluir bloco `Análise das Alternativas`.
4. **Incompatibilidade de parser entre banco e `QuestionCard.tsx`:**
   - **661** questões no `questions_revalida` (e **8** no `questions_direto`) usam `💡 **Take-Home Message:**` no início da linha. O regex de [`QuestionCard.tsx`](file:///d:/bancoresidencia/src/components/QuestionCard.tsx#L881) exige início de linha seguido apenas de `#` ou `*`, falhando ao encontrar `💡 ` e impedindo a renderização do card azul de Take-Home Message.
5. **Falta de um "Selo Absoluto" único e determinístico no Supabase:**
   - Hoje `commentary_tier` (tabela-base) e `has_gold_commentary` (índice) utilizam regras distintas e não existe uma trava única atômica (check determinístico dos 4 pilares + vínculo criptográfico/trigger ao conteúdo real de `commentary`, `options`, `type` e `has_gabarito`) que garanta 100% de paridade entre selo na tabela, selo no índice e filtro do aluno.

---

## 9. Requisitos Técnicos Mapeados para o Futuro "Selo Absoluto"

Para que o filtro **"Comentadas"** entregue ao estudante **0% de Falsos Positivos** e **0% de Falsos Negativos**, os dados auditados apontam para a necessidade futura (a ser detalhada na etapa de planejamento) de:

1. **Unificar a Verdade em um Selo Único Determinístico (ex.: função validadora estrita + selo sincronizado nas 4 tabelas e em `study_question_index`):**
   - Exigir conjuntamente (`AND`) os **4 pilares**:
     - **Pilar 1 (Justificativa):** Para objetivas (`Múltipla escolha` / `Certo ou errado` com opções), 100% das alternativas válidas com justificativa não genérica (`options[].explanation` ou bloco `Análise das Alternativas`); para discursivas (`Discursiva` / `Dissertativa`), rubrica/justificativa estruturada (`Padrão de Resposta` ou prosa clínica substantiva).
     - **Pilar 2 (Comentário Final):** Síntese clínica não vazia após remoção dos blocos auxiliares, sem saudações legadas, HTML ou JSON bruto.
     - **Pilar 3 (Take-Home Message):** Cabeçalho compatível com o parser de `QuestionCard.tsx` (normalizando ou aceitando `💡`) e conteúdo não vazio.
     - **Pilar 4 (Principal Motivo de Erro):** Cabeçalho compatível com `QuestionCard.tsx` e conteúdo não vazio.
2. **Saneamento Direcionado dos Subgrupos Identificados:**
   - **44.443** questões com os 3 pilares de corpo mas sem justificativas individuais das alternativas.
   - **144** questões com imagem que têm apenas `options[].explanation` e `commentary = ""` (mais **7** sem imagem).
   - **661** questões do Revalida (`490` objetivas + `171` discursivas) com `💡 Take-Home` e sem `Principal Motivo de Erro`.
   - **17** questões do R+ com saudação legada (`"Olá, estudante!"`).
   - **14.986** questões que **já são 100% Padrão-Ouro** e hoje estão injustamente com `commentary_tier = NULL` (bastando reclassificação determinística para receberem o selo).
   - Limpeza de **1** discursiva vazia com selo fantasma (`bc3d62c5`), **2** questões do Revalida com opções duplicadas (`8` opções), **2** questões com divergência entre texto e letra do gabarito (`HMG-2017-CIR-10405`, `CERMAM-2018-CIR-18054`), e revisão das **198** discursivas marcadas como `ANULADA`.
3. **Alinhamento do Filtro Legado de Fallback (`/api/questions`)** ao mesmo selo absoluto do índice `study_question_index`, eliminando divergências entre endpoints.
