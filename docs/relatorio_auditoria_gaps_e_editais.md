# 📋 Censo Estruturado de Integridade de Editais e Gaps de Provas

> **Data de Emissão:** 01/11/2026  
> **Escopo:** Análise e classificação de todos os 2.261 cadernos oficiais cadastrados.

---

## 1. Quadro Geral de Diagnóstico

| Categoria | Volume | % do Acervo | Diagnóstico e Ação |
| :--- | :---: | :---: | :--- |
| **1. Contagem Exata de Edital** | **1018** | **45.0%** | O número de questões no banco bate 100% com o padrão oficial (100, 80, 75, 50, etc.). |
| **2. Reconciliados por Anulação** | **109** | **4.8%** | As questões ativas somadas às anuladas fecham exatamente o edital. **Ação de UI:** Exibir total nominal. |
| **3. Gaps Reais de OCR / Extração** | **647** | **28.6%** | Faltam de 1 a 8 questões para fechar o caderno (falha em imagens/tabelas no OCR antigo). **Ação:** Reprocessar via Gemini Vision. |
| **4. Editais Específicos / Fragmentados** | **487** | **21.5%** | Provas de módulos complementares ou editais regionais atípicos. |
| **Total Analisado** | **2261** | **100%** | Universo de provas no banco |

---

## 2. Amostra de Provas com Gaps Reais de OCR (Alvo do Gemini Vision)

| ID | Instituição | Ano | Caderno | Questões no Banco | Anuladas | Soma | Edital Previsto | Faltantes |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `exam_5` | Afya Araguaína | 2026 | Geral | 90 | 2 | 92 | 100 questões | **8** |
| `exam_9` | AMP | 2026 | Geral | 48 | 0 | 48 | 50 questões | **2** |
| `exam_11` | AMRIGS | 2026 | Geral | 24 | 0 | 24 | 25 questões | **1** |
| `exam_12` | AMRIGS | 2026 | Geral | 23 | 0 | 23 | 25 questões | **2** |
| `exam_40` | UFCSPA | 2026 | Geral | 28 | 0 | 28 | 30 questões | **2** |
| `exam_68` | HSP-UNIFESP | 2026 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_76` | HSPE-FMO | 2026 | Geral | 59 | 0 | 59 | 60 questões | **1** |
| `exam_87` | IPSEMG | 2026 | Geral | 48 | 0 | 48 | 50 questões | **2** |
| `exam_93` | PSU-GO | 2026 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_110` | SES-DF | 2026 | Geral | 79 | 0 | 79 | 80 questões | **1** |
| `exam_135` | HU-UEL | 2026 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_142` | HCPA | 2026 | Geral | 36 | 0 | 36 | 40 questões | **4** |
| `exam_148` | HC-UNICAMP | 2026 | 01 | 70 | 1 | 71 | 75 questões | **4** |
| `exam_163` | HCFMUSP | 2026 | Geral | 117 | 0 | 117 | 120 questões | **3** |
| `exam_165` | HCFMUSP | 2026 | Geral | 114 | 0 | 114 | 120 questões | **6** |
| `exam_167` | HCFMRP-USP | 2026 | Geral | 99 | 0 | 99 | 100 questões | **1** |
| `exam_169` | HCFMRP-USP | 2026 | Geral | 99 | 0 | 99 | 100 questões | **1** |
| `exam_180` | CBO Teórica 1 | 2025 | Geral | 55 | 0 | 55 | 60 questões | **5** |
| `exam_181` | CBO Teórica 2 | 2025 | Geral | 97 | 0 | 97 | 100 questões | **3** |
| `exam_182` | CBO Teórico-Prática | 2025 | Geral | 48 | 0 | 48 | 50 questões | **2** |
| `exam_185` | UNESC Colatina | 2025 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_191` | Multivix Vitória | 2025 | Geral | 56 | 1 | 57 | 60 questões | **3** |
| `exam_196` | CMC | 2025 | Geral | 37 | 0 | 37 | 40 questões | **3** |
| `exam_197` | DASA | 2025 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_206` | FCM-MG | 2025 | Geral | 70 | 4 | 74 | 75 questões | **1** |
| `exam_218` | UFCSPA | 2025 | Geral | 18 | 0 | 18 | 25 questões | **7** |
| `exam_223` | HAS | 2025 | Geral | 97 | 2 | 99 | 100 questões | **1** |
| `exam_225` | HEJSN | 2025 | Geral | 96 | 0 | 96 | 100 questões | **4** |
| `exam_232` | Einstein | 2025 | Geral | 49 | 0 | 49 | 50 questões | **1** |
| `exam_233` | Einstein | 2025 | Geral | 97 | 0 | 97 | 100 questões | **3** |

---

## 3. Diretrizes de Correção Aplicadas
1. **Frontend / UX:** O card de provas calcula o total nominal da prova e adiciona badges informativas sobre questões anuladas e editais diferenciados.
2. **Pipeline Gemini Vision:** Scripts específicos recuperam apenas as páginas dos itens faltantes das 647 provas mapeadas.
