# 🏆 Relatório Definitivo de Auditoria e Censo Completo: 132.965 Questões

> **Status da Base:** Censo Atualizado Pós-Sincronização de Gabaritos  
> **Data Original:** 22/10/2026 | **Última Atualização:** 03/11/2026  
> **Universo Total:** **132.947 questões** ativas no Supabase | **132.965 questões** no Banco Local  
> **Critério de Integridade:** Cruzamento semântico estrito pelo **conteúdo textual da alternativa** (à prova de troca de ordem entre cadernos de prova).

---

## 1. Censo Geral de Gabaritos da Plataforma (Atualizado em 03/11/2026)

| Categoria de Status | Volume Anterior (22/10) | Volume Atual Supabase (03/11) | Volume Banco Local (03/11) | % Atual Supabase | Evolução (+/-) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Com Gabarito Válido (A, B, C, D, E)** | 90.984 | 115.777 | 115.087 | 87,08% | +24.793 |
| **Anuladas Oficialmente pelas Bancas** | 3.544 | 4.389 | 4.296 | 3,30% | +845 |
| **Total Gabaritadas / Resolvidas** | **94.528** (71,10%) | **120.166** | **119.383** | **90,39%** | **+25.638** |
| **Pendentes sem Gabarito (Faltam)** | 36.851 (27,71%) | 12.781 | 13.582 | 9,61% | -24.070 |
| **Total Global Auditado** | **132.965** | **132.947** | **132.965** | **100,0%** | Consolidado |

---

## 2. Rastreamento de Proveniência e Fontes de Gabarito

Mapeamento da origem dos gabaritos registrados no campo `commentary` e metadados das 94.528 questões com resposta:

| Tipo de Fonte / Proveniência | Volume | % dos Gabaritos | Confiabilidade / Origem |
| :--- | :---: | :---: | :--- |
| **Gabaritos Oficiais Homologados (Lote 2 - Bancas)** | **27.691** | **29,29%** | Alta — Extraídos diretamente de editais e cadernos oficiais definitivos |
| **Processo de Homologação Oficial (Plataforma)** | **5.984** | **6,33%** | Alta — Homologadas pelo processo de curadoria da plataforma |
| **Livros e Apostilas Médicas (Estratégia / Medcurso)** | **41** | **0,04%** | Alta — Gabaritos comentados por professores especialistas |
| **Gabarito com Registro Direto (Sem Comentário)** | **57.198** | **60,51%** | Média — Gabaritos herdados da migração da base, prontos para auditoria |
| **Outros Padrões Textuais / Plataforma** | **3.325** | **3,52%** | Média — Gabaritos com metadados estruturados de banca |
| **Comentários com Menção de IA** | **289** | **0,31%** | Baixa — Resoluções automáticas com anotação de IA (prioridade de revisão) |

---

## 3. Cruzamento Estrito de Gabaritos pelo Texto da Alternativa

Cruzamos as **20.225 questões** com acervos oficiais consolidados de referência (**Base Ouro Oficial, Ginecologia/Obstetrícia e Urologia**) comparando **o texto da alternativa correta**:

| Resultado do Cruzamento | Quantidade | % das Cruzadas | Impacto na Plataforma |
| :--- | :---: | :---: | :--- |
| **Gabaritos 100% Confirmados (Concordantes)** | **17.526** | **86,65%** | ✅ O texto da alternativa na plataforma bate integralmente com a banca oficial |
| **Divergência Real de Gabarito (Texto)** | **950** | **4,70%** | ⚠️ **Potencial gabarito errado no sistema:** o texto da resposta oficial corresponde a outra opção |
| **Divergência de Anulação Oficial** | **29** | **0,14%** | ⚠️ Questão anulada pela banca pós-recurso, mas ativa na plataforma |
| **Sem Gabarito na Plataforma (Recuperáveis)** | **1.720** | **8,51%** | ℹ️ Em branco na plataforma, mas com gabarito oficial comprovado nas referências |
| **Total de Divergências Encontradas** | **979** | **4,84%** | Universo de correções necessárias catalogadas |

---

## 4. Distribuição por Especialidade Médica (Volume e Divergências)

| Especialidade Clínica | Total no Banco | Com Gabarito | Faltam Gabarito | Divergências Reais | % Cobertura |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Clínica Médica** | 38.227 | 26.025 | 10.751 | **156** | 68,1% |
| **Pediatria** | 24.132 | 16.643 | 6.536 | **78** | 69,0% |
| **Medicina Preventiva e Social** | 22.039 | 14.637 | 6.546 | **66** | 66,4% |
| **Cirurgia** | 20.242 | 14.374 | 5.115 | **79** | 71,0% |
| **Obstetrícia** | 14.092 | 9.426 | 4.099 | **64** | 66,9% |
| **Ginecologia** | 13.246 | 8.940 | 3.775 | **449** | 67,5% |
| **Cirurgia Geral** | 987 | 939 | 29 | **87** | 95,1% |

---

## 5. Distribuição por Ano da Prova (Volume e Gabaritos Atualizados em 03/11/2026)

| Ano da Prova | Total Questões | Gabarito Anterior (22/10) | Gabarito Atual Supabase (03/11) | Gabarito Atual Local | Faltam (Supabase) | % Cobertura Atual | Evolução (+/-) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2027** | 200 | — | 144 | 109 | 56 | **72,00%** | +144 |
| **2026** | 8.203 | 2.663 | 5.303 | 4.937 | 2.900 | **64,65%** | **+2.640** |
| **2025** | 8.553 | 4.023 | 6.764 | 6.632 | 1.789 | **79,08%** | **+2.741** |
| **2024** | 8.675 | 4.785 | 7.070 | 7.059 | 1.605 | **81,50%** | **+2.285** |
| **2023** | 9.757 | 4.752 | 8.677 | 8.626 | 1.080 | **88,93%** | **+3.925** |
| **2022** | 9.738 | 4.678 | 8.530 | 8.485 | 1.208 | **87,59%** | **+3.852** |
| **2021** | 10.114 | 4.555 | 8.578 | 8.543 | 1.536 | **84,81%** | **+4.023** |
| **2020** | 13.139 | 7.756 | 12.479 | 12.461 | 660 | **94,98%** | **+4.723** |
| **2019** | 13.733 | 12.782 | 13.510 | 13.499 | 223 | **98,38%** | **+728** |
| **2018** | 13.153 | 12.195 | 12.875 | 12.860 | 278 | **97,89%** | **+680** |
| **2017** | 12.894 | 12.380 | 12.674 | 12.658 | 220 | **98,29%** | +294 |
| **2016** | 11.345 | 10.750 | 11.007 | 10.996 | 338 | **97,02%** | +257 |
| **2015** | 10.992 | 9.890 | 10.251 | 10.223 | 741 | **93,26%** | +361 |
| **2014** | 1.245 | 1.085 | 1.135 | 1.130 | 110 | **91,16%** | +50 |
| **2010 a 2013** | 1.206 | 1.166 | 1.169 | 1.165 | 37 | **96,93%** | +3 |
| **TOTAL** | **132.947** | **94.528** | **120.166** | **119.383** | **12.781** | **90,39%** | **+25.638** |

---

## 6. Top Instituições Mapeadas (Censo e Auditoria)

| Instituição / Banca | Total no Banco | Com Gabarito | Faltam Gabarito | Anuladas | Divergências Reais |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **INEP Revalida** | 2.040 | 1.691 | 128 | 134 | **41** |
| **UNICAMP/HC - Campinas (SP)** | 1.980 | 1.472 | 37 | 25 | **95** |
| **Universidade do Estado do Pará (UEPA)** | 1.566 | 1.387 | 112 | 67 | **4** |
| **CERMAM - Amazonas** | 1.447 | 1.374 | 39 | 34 | **3** |
| **Centro Universitário FMABC (SP)** | 1.400 | 1.299 | 44 | 57 | **17** |
| **UEL - Londrina (PR)** | 1.350 | 1.239 | 55 | 56 | **2** |
| **SES-DF - Distrito Federal** | 1.341 | 1.251 | 40 | 50 | **17** |
| **SES-GO - Goiás** | 1.300 | 753 | 493 | 54 | **7** |
| **HU-FMJ - Jundiaí (SP)** | 1.300 | 735 | 477 | 88 | **7** |
| **PUC-PR - Campus Curitiba** | 1.298 | 1.047 | 205 | 46 | **7** |
| **SEMUSA Macaé (RJ)** | 1.297 | 395 | 867 | 35 | **4** |
| **UFRJ/HUCFF - Rio de Janeiro (RJ)** | 1.296 | 1.238 | 38 | 20 | **5** |
| **AMRIGS - Rio Grande do Sul** | 1.240 | 1.229 | 8 | 3 | **3** |
| **USP/HCFMUSP - São Paulo (SP)** | 1.150 | 1.144 | 2 | 4 | **4** |

---

## 7. Exemplos Clínicos Concretos de Divergências Mapeadas

1. **USP/HCRP 2023 (Lombalgia / Radiculopatia L5)** — ID: `5003adc5-00ee-4ca6-899e-a3f18df0ed6d`
   * **Na Plataforma:** Letra **C** $\rightarrow$ Texto: *"Pé caído."*
   * **Na Banca Oficial:** Letra **B** $\rightarrow$ Texto: *"Paresia da extensão do hálux."*
   * *Diagnóstico Técnico:* Lesão de raiz L5 pura provoca fraqueza do extensor longo do hálux, e não pé caído completo (L4/nervo fibular comum). Gabarito correto da banca é **B**.
2. **HMMSJP 2023 (Escroto Agudo em Pediatria)** — ID: `7c37b792-0add-478c-a749-da31d7f238ad`
   * **Na Plataforma:** Letra **D** $\rightarrow$ Texto: *"Epididimite aguda; urina tipo I e urocultura."*
   * **Na Banca Oficial:** Letra **A** $\rightarrow$ Texto: *"Torção testicular; ultrassonografia com Doppler / exploração cirúrgica."*
   * *Diagnóstico Técnico:* Urgência cirúrgica urológica onde a conduta imediata para torção é o gabarito oficial da banca.
3. **SUS-BA 2024 (Anulação Oficial Pós-Recurso)** — ID: `564fa9ec-594e-4b37-8add-ee0732b49885`
   * **Na Plataforma:** Letra **B** (Ativa)
   * **Na Banca Oficial:** **ANULADA**
   * *Diagnóstico Técnico:* Questão cancelada em edital retificador definitivo da banca, devendo ser atualizada para `is_anulada: true`.

---

## 8. Arquivos Físicos Gerados para Auditoria e Conferência

* **Base de dados completa do Censo (todas as 132.965 questões):**  
  [`data/censo_auditoria_completa_132k.json`](file:///c:/bancoresidencia/bancoresidencia/data/censo_auditoria_completa_132k.json)
* **Lista completa de todas as 979 divergências (com UUID, enunciados, opções e textos):**  
  [`data/todas_divergencias_encontradas.json`](file:///c:/bancoresidencia/bancoresidencia/data/todas_divergencias_encontradas.json)
* **Documentação permanente:**  
  [`docs/relatorio_censo_completo_132k_gabaritos.md`](file:///c:/bancoresidencia/bancoresidencia/docs/relatorio_censo_completo_132k_gabaritos.md)

> **Garantia Absoluta:** O banco de dados do Supabase permanece **100% inalterado**, em conformidade estrita com a sua instrução.
