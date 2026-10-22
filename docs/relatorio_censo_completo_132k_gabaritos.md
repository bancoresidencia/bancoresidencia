# 🏆 Relatório Definitivo de Auditoria e Censo Completo: 132.965 Questões

> **Modo de Execução:** 100% Leitura (*Read-Only*) — **Zero alterações realizadas no banco de dados.**  
> **Data de Conclusão:** 22/10/2026 | **Duração do Processamento:** 153,3 segundos (via Keyset B-Tree)  
> **Universo Total:** **132.965 questões** varridas individualmente na tabela `questions` do Supabase.  
> **Critério de Integridade:** Cruzamento semântico estrito pelo **conteúdo textual da alternativa** (à prova de troca de ordem entre cadernos de prova).

---

## 1. Censo Geral de Gabaritos da Plataforma (132.965 Questões)

| Categoria de Status | Volume de Questões | % do Banco | Diagnóstico Operacional |
| :--- | :---: | :---: | :--- |
| **Com Gabarito Válido (A, B, C, D, E)** | **90.984** | **68,43%** | Questões objetivas prontas para resolução com alternativa assinalada |
| **Anuladas Oficialmente pelas Bancas** | **3.544** | **2,67%** | Questões canceladas pós-recurso em editais oficiais (`is_anulada: true`) |
| **Total Gabaritadas / Resolvidas** | **94.528** | **71,10%** | **Universo total de questões utilizáveis com resposta/anulação** |
| **Pendentes sem Gabarito (Faltam)** | **36.851** | **27,71%** | Questões no banco que ainda não possuem resposta cadastrada |
| **Discursivas / Segunda Fase** | **1.586** | **1,19%** | Questões dissertativas sem alternativas de múltipla escolha |
| **Total Global Auditado** | **132.965** | **100,0%** | Censo integral de todas as linhas cadastradas |

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

## 5. Distribuição por Ano da Prova (Volume e Divergências)

| Ano da Prova | Total de Questões | Com Gabarito | Faltam Gabarito | Divergências Reais |
| :---: | :---: | :---: | :---: | :---: |
| **2026** | 8.203 | 2.663 | 5.275 | **34** |
| **2025** | 8.553 | 4.023 | 4.246 | **135** |
| **2024** | 8.693 | 4.785 | 3.547 | **138** |
| **2023** | 9.757 | 4.752 | 4.632 | **157** |
| **2022** | 9.738 | 4.678 | 4.729 | **96** |
| **2021** | 10.114 | 4.555 | 5.216 | **67** |
| **2020** | 13.139 | 7.756 | 4.957 | **53** |
| **2019** | 13.733 | 12.782 | 381 | **55** |
| **2018** | 13.153 | 12.195 | 469 | **66** |
| **2014 a 2017** | 37.682 | 34.771 | 3.399 | **128** |

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
