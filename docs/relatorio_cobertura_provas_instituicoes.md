# 📊 Relatório Estratégico de Provas, Instituições e Cobertura de Gabaritos

> **Data de Geração:** 19 de Outubro de 2026  
> **Universo Analisado:** Base canônica consolidada das 7 grandes áreas médicas (`cirurgia`, `clinica_medica`, `ginecologia`, `obstetricia`, `pediatria`, `medicina_preventiva`, `urologia`).  
> **Arquivos Exportados:**
> * 📄 Planilha Geral: [`relatorio_provas_instituicoes_ano.csv`](file:///d:/bancoresidencia/data/relatorio_provas_instituicoes_ano.csv) (1.872 provas mapeadas)
> * 📄 Caderno de Questões Prioritárias: [`questoes_faltantes_max10.csv`](file:///d:/bancoresidencia/data/questoes_faltantes_max10.csv) (2.392 questões com enunciados e alternativas completas para provas com $\le 10$ pendências)

---

## 🎯 1. Sumário Executivo & Grandes Números

| Indicador | Quantidade | Observação |
| :--- | :---: | :--- |
| **Total de Questões Únicas no Banco** | **132.965** | Desduplicação estrita por UUID / Código |
| **Total de Provas Distintas Identificadas** | **1.872** | Agrupamento por Instituição × Banca × Ano × Caderno |
| **Total de Instituições Mapeadas** | **288** | Cobertura nacional (Residência, Revalida e R+) |
| **Intervalo Temporal Coberto** | **2010 — 2027** | 18 anos de processos seletivos oficiais |
| **Questões com Gabarito Oficial Homologado** | **80.898** | Alternativa oficial confirmada (`A` a `E`) |
| **Questões Anuladas Oficialmente** | **3.637** | Anuladas pela banca (consideradas resolvidas) |
| **Questões Discursivas (2ª Fase / Isoladas)** | **1.793** | Questões dissertativas sem gabarito de múltipla escolha |
| **Total de Questões Auditadas / Resolvidas** | **86.328** | **64,93%** de cobertura global do banco |
| **Total de Questões Pendentes de Gabarito** | **46.637** | **35,07%** do banco aguardando homologação |

---

## 📅 2. Distribuição e Evolução Temporal por Ano

A tabela a seguir consolida o volume de provas, questões únicas e taxa de resolução ano a ano:

| Ano | Provas | Questões Únicas | Gabaritos Válidos | Anuladas | Discursivas | Faltantes | % Cobertura | Status Dominante |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2027** | 3 | 200 | 100 | 0 | 0 | 100 | **50,0%** | 🟡 Em captação inicial |
| **2026** | 109 | 8.203 | 1.078 | 192 | 100 | 6.833 | **16,7%** | 🟡 Safra recente em homologação |
| **2025** | 121 | 8.553 | 2.829 | 217 | 135 | 5.372 | **37,2%** | 🟡 Curadoria em andamento |
| **2024** | 124 | 8.693 | 3.880 | 263 | 160 | 4.390 | **49,5%** | 🟡 Em consolidação |
| **2023** | 139 | 9.757 | 3.596 | 293 | 115 | 5.753 | **41,0%** | 🟡 Prioridade de importação |
| **2022** | 141 | 9.738 | 3.192 | 267 | 114 | 6.165 | **36,7%** | 🟡 Prioridade de importação |
| **2021** | 155 | 10.114 | 3.185 | 300 | 65 | 6.564 | **35,1%** | 🟡 Prioridade de importação |
| **2020** | 181 | 13.139 | 7.303 | 311 | 127 | 5.398 | **58,9%** | 🟢 Boa cobertura |
| **2019** | 187 | 13.733 | 12.734 | 341 | 231 | 427 | **96,9%** | ✅ Praticamente blindado |
| **2018** | 184 | 13.153 | 11.989 | 394 | 198 | 672 | **94,9%** | ✅ Praticamente blindado |
| **2017** | 182 | 12.894 | 11.647 | 359 | 173 | 715 | **94,5%** | ✅ Praticamente blindado |
| **2016** | 160 | 11.345 | 9.446 | 341 | 212 | 1.346 | **88,1%** | 🟢 Alta densidade |
| **2015** | 153 | 10.992 | 8.231 | 309 | 243 | 2.209 | **79,9%** | 🟢 Boa densidade |
| **2014** | 15 | 1.245 | 887 | 21 | 5 | 332 | **73,3%** | 🟢 Histórico estável |
| **2013** | 7 | 575 | 434 | 19 | 5 | 117 | **79,7%** | 🟢 Histórico estável |
| **2012** | 4 | 275 | 154 | 1 | 5 | 115 | **58,2%** | 🟡 Histórico parcial |
| **2011** | 4 | 275 | 141 | 8 | 5 | 121 | **56,0%** | 🟡 Histórico parcial |
| **2010** | 3 | 81 | 72 | 1 | 0 | 8 | **90,1%** | ✅ Histórico blindado |
| **Total** | **1.872** | **132.965** | **80.898** | **3.637** | **1.793** | **46.637** | **64,93%** | — |

> **Insight Estratégico:** Os anos de **2017 a 2019** estão com cobertura superior a **95%**, servindo como padrão-ouro histórico. A maior concentração de lacunas absolutas está nos anos de **2021 a 2026**, justamente os mais demandados pelos alunos para simulados de reta final.

---

## 🚀 3. Oportunidade Tática: Provas com $\le 10$ Questões Faltantes

Identificamos um grupo expressivo de provas que estão **à beira da homologação total (100% blindadas)**. Faltam no máximo 10 questões para fechar o gabarito completo dessas provas:

### Distribuição de Pendências Rápidas

```
┌───────────────────────────────────────┬────────────┬────────────────────────┐
│ Faixa de Pendência                    │ N° Provas  │ Total Questões a Sanar │
├───────────────────────────────────────┼────────────┼────────────────────────┤
│ Provas faltando APENAS 1 questão      │ 195 provas │ 195 questões           │
│ Provas faltando APENAS 2 questões     │ 148 provas │ 296 questões           │
│ Provas faltando de 3 a 5 questões     │ 257 provas │ 972 questões           │
│ Provas faltando de 6 a 10 questões    │ 124 provas │ 929 questões           │
├───────────────────────────────────────┼────────────┼────────────────────────┤
│ TOTAL DESTA JANELA DE OPORTUNIDADE    │ 724 provas │ 2.392 questões         │
└───────────────────────────────────────┴────────────┴────────────────────────┘
```

### Impacto Imediato:
* O banco possui hoje **355 provas 100% blindadas**.
* Ao resolver ou homologar apenas as **2.392 questões** listadas no CSV auxiliar, o número de provas 100% completas saltará de **355 para 1.079 provas** (um aumento de **+203,9%** em provas completamente gabaritadas, cobrindo **57,6%** de todas as provas do banco)!

---

## 🏆 4. Top Provas 100% Blindadas (Completas no Banco)

Exemplos de provas volumosas com 100% das questões resolvidas (gabarito válido + anuladas):

| Instituição | Banca | Ano | Tipo / Caderno | Questões Únicas | % Cobertura | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| **SES-DF** | SES-DF | 2019 | Prova 1 / Regular | 120 | 100,0% | ✅ 100% Blindada |
| **HOA Goiânia** | HOA | 2017 | Prova 1 / Regular | 118 | 100,0% | ✅ 100% Blindada |
| **HOA Goiânia** | HOA | 2019 | Prova 1 / Regular | 113 | 100,0% | ✅ 100% Blindada |
| **USP / HCFMUSP** | USP/HCFMUSP | 2025 | Prova 1 / Regular | 110 | 100,0% | ✅ 100% Blindada |
| **UNICAMP** | UNICAMP/HC | 2024 | Prova 1 / Regular | 108 | 100,0% | ✅ 100% Blindada |
| **USP / HCFMUSP** | USP/HCFMUSP | 2021 | Prova 1 / Regular | 108 | 100,0% | ✅ 100% Blindada |
| **USP / HCFMUSP** | USP/HCFMUSP | 2024 | Prova 1 / Regular | 107 | 100,0% | ✅ 100% Blindada |
| **USP / HCFMUSP** | USP/HCFMUSP | 2023 | Prova 1 / Regular | 107 | 100,0% | ✅ 100% Blindada |
| **UERJ / HUPE** | UERJ/HUPE | 2019 | Prova 1 / Regular | 104 | 100,0% | ✅ 100% Blindada |
| **AMRIGS** | AMRIGS | 2025 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |
| **AMRIGS** | AMRIGS | 2024 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |
| **AMRIGS** | AMRIGS | 2023 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |
| **AMRIGS** | AMRIGS | 2022 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |
| **AMRIGS** | AMRIGS | 2021 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |
| **AMP - Paraná** | AMP | 2019 | Prova 1 / Regular | 100 | 100,0% | ✅ 100% Blindada |

---

## ⚠️ 5. Maiores Gargalos (Provas Prioritárias para Ingestão de Gabarito)

Provas com maior volume absoluto de questões sem gabarito:

| Instituição | Ano | Total Questões | Gabaritos Presentes | Faltantes | % Cobertura |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ABEM — Teste de Progresso Nacional** | 2025 | 221 | 0 | **221** | 0,0% |
| **SES-GO - Secretaria de Saúde de Goiás** | 2026 | 200 | 27 | **173** | 13,5% |
| **IOG - Instituto de Olhos de Goiânia** | 2024 | 150 | 35 | **115** | 23,3% |
| **INEP Revalida** | 2014 | 115 | 8 | **107** | 7,0% |
| **SES-DF** | 2021 | 121 | 15 | **106** | 12,4% |
| **ABEM — Teste de Progresso Nacional** | 2026 | 110 | 5 | **105** | 4,5% |
| **INEP Revalida** | 2012 | 115 | 11 | **104** | 9,6% |
| **CEPOA - Oculistas Associados (RJ)** | 2026 | 100 | 0 | **100** | 0,0% |
| **Complexo Américas (RJ)** | 2026 | 100 | 0 | **100** | 0,0% |
| **Hospital Sírio-Libanês (SP)** | 2027 | 100 | 0 | **100** | 0,0% |
| **Santa Casa de Maceió (AL)** | 2026 | 100 | 0 | **100** | 0,0% |
| **USCS - São Caetano do Sul** | 2025 | 100 | 0 | **100** | 0,0% |
| **USCS - São Caetano do Sul** | 2024 | 100 | 0 | **100** | 0,0% |
| **INEP Revalida** | 2015 | 115 | 16 | **99** | 13,9% |

---

## 📁 6. Dicionário dos Arquivos CSV Gerados

### 1. `data/relatorio_provas_instituicoes_ano.csv`
* **Caminho absoluto:** [`data/relatorio_provas_instituicoes_ano.csv`](file:///d:/bancoresidencia/data/relatorio_provas_instituicoes_ano.csv)
* **Estrutura:** 1.872 linhas (uma linha para cada Prova de cada Instituição em cada Ano).
* **Campos:**
  1. `instituicao`: Nome oficial da instituição médica.
  2. `banca`: Banca examinadora responsável.
  3. `ano`: Ano do exame seletivo.
  4. `tipo_prova`: Caderno ou tipo da prova (ex: `Prova 1 / Regular`, `2ª Aplicação`, etc.).
  5. `total_questoes_unicas`: Contagem desduplicada de questões pertencentes a esta prova.
  6. `com_gabarito_valido`: Quantidade de questões com alternativa correta definida (`A`, `B`, `C`, `D`, `E`).
  7. `anuladas_oficiais`: Quantidade de questões anuladas oficialmente pela banca.
  8. `discursivas_segunda_fase`: Questões dissertativas/abertas isoladas.
  9. `total_auditadas_resolvidas`: Soma de válidas + anuladas + discursivas.
  10. `faltam_gabaritos`: Quantidade exata de questões sem gabarito nesta prova.
  11. `percentual_cobertura`: Percentual de homologação da prova ($\% \text{ Auditado}$).

### 2. `data/questoes_faltantes_max10.csv`
* **Caminho absoluto:** [`data/questoes_faltantes_max10.csv`](file:///d:/bancoresidencia/data/questoes_faltantes_max10.csv)
* **Estrutura:** 2.392 linhas correspondentes a cada uma das questões pendentes das **724 provas que possuem entre 1 e 10 questões faltantes**.
* **Campos:**
  1. `instituicao`, `banca`, `ano`, `tipo_prova`
  2. `faltam_na_prova`: Quantas questões faltam no total para fechar 100% daquela prova (ex: `1`, `2`, `5`, etc.).
  3. `questao_id`: Identificador UUID único no banco.
  4. `codigo`: Código mnemônico (ex: `USP-2024-CIR-0012`).
  5. `especialidade`, `tema`, `foco`, `subfoco`: Taxonomia clínica associada.
  6. `enunciado`: Texto completo da questão (formatado com escape RFC 4180).
  7. `opcoes`: Alternativas completas formatadas (`A) ... \n B) ... \n C) ... \n D) ...`).

---

## 🛠️ Como Recalcular no Futuro

Para atualizar esses relatórios e os dois arquivos CSV a qualquer momento após novos lotes de homologação de gabarito, basta rodar:

```bash
node scripts/generate_exams_coverage_report.mjs
```
