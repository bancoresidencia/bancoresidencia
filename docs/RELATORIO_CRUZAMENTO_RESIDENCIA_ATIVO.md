# Relatório de Cruzamento e Deduplicação: Expansão vs. Banco Ativo

> **Data de Execução:** 08/11/2026 18:32:13  
> **Status:** Concluído com Sucesso  
> **Base de Expansão Processada:** `data/bancos_organizados_staging/residencia_acesso_direto.db`  
> **Base Ativa de Referência:** 132.965 questões em 6 arquivos JSON (`cirurgia`, `clinica_medica`, `ginecologia`, `medicina_preventiva`, `obstetricia`, `pediatria`)

---

## 1. Resumo Executivo das Métricas

| Métrica | Quantidade | Percentual |
| :--- | :---: | :---: |
| **Total Inicial na Expansão (Acesso Direto)** | **164,870** | 100,00% |
| **Duplicatas Encontradas no Banco Ativo (Eliminadas)** | **99,697** | **60.47%** |
| • *Matches Exatos (Hash SHA-256 100%)* | *89,470* | *54.27%* |
| • *Matches Fuzzy ($\ge 85\%$ + Congruência de Alternativas)* | *10,227* | *6.20%* |
| **Sobra Líquida (Questões Inéditas Remanescentes)** | **65,173** | **39.53%** |
| **Tamanho do Arquivo SQLite Após Purga & VACUUM** | **372.18 MB** | *(Redução de ~590.18 MB)* |

---

## 2. Duplicatas Identificadas por Especialidade do Banco Ativo

| Especialidade Ativa | Arquivo Ativo | Total no Banco Ativo | Matches Detectados na Expansão |
| :--- | :--- | :---: | :---: |
| **Clínica Médica** | `clinica_medica_final_questions.json` | 38.227 | **28,301** |
| **Cirurgia Geral** | `cirurgia_final_questions.json` | 21.229 | **15,045** |
| **Pediatria** | `pediatria_final_questions.json` | 24.132 | **18,664** |
| **Medicina Preventiva** | `medicina_preventiva_final_questions.json` | 22.039 | **16,788** |
| **Obstetrícia** | `obstetricia_final_questions.json` | 14.092 | **10,842** |
| **Ginecologia** | `ginecologia_final_questions.json` | 13.246 | **10,057** |
| **TOTAL** | — | **132.965** | **99,697** |

---

## 3. Perfil da Sobra Líquida (Questões Inéditas Remanescentes: 65,173)

### 3.1. Indicadores de Qualidade da Sobra
- **Instituição Preenchida:** 65,173 (100.00%)
- **Ano Válido:** 65,159 (99.98%)
- **Gabarito Homologado Válido:** 62,725 (96.24%)

### 3.2. Top 10 Instituições na Sobra Líquida
| Instituição | Questões Inéditas |
| :--- | :---: |
| Faculdade de Medicina de São José do Rio Preto | **2,354** |
| FGV - Fundação Getúlio Vargas | **1,273** |
| Sistema Único de Saúde - Pernambuco | **769** |
| Pontifícia Universidade Católica do Paraná | **709** |
| Secretaria de Estado da Saúde de Santa Catarina | **701** |
| Hospital de Clínicas de Porto Alegre | **669** |
| Fundação João Goulart | **661** |
| Universidade Federal de Santa Catarina | **646** |
| Associação Médica do Paraná | **615** |
| Universidade Federal do Maranhão | **608** |

### 3.3. Top Especialidades na Sobra Líquida
| Especialidade | Questões Inéditas |
| :--- | :---: |
| Clínica Médica | **24,434** |
| Ginecologia e Obstetrícia | **8,661** |
| Cirurgia | **8,463** |
| Pediatria | **7,485** |
| Preventiva | **7,247** |
| ClinicaMedica | **422** |
| Obstetricia | **172** |
| Ginecologia | **135** |

### 3.4. Distribuição Temporal por Ano (Recortes Principais)
| Ano | Questões Inéditas |
| :---: | :---: |
| 2027 | **532** |
| 2026 | **2,144** |
| 2025 | **1,584** |
| 2024 | **1,960** |
| 2023 | **3,122** |
| 2022 | **2,603** |
| 2021 | **4,179** |
| 2020 | **2,045** |
| 2019 | **2,462** |
| 2018 | **2,217** |
| 2017 | **1,950** |
| 2016 | **4,026** |
| 2015 | **1,367** |
| 2014 | **8,142** |
| 2013 | **7,401** |

---

## 4. Amostra de Auditoria de Congruência (Matches Detectados e Eliminados)

Abaixo estão 10 pares de questões identificados e eliminados, demonstrando a perfeita congruência de conteúdo, gabarito e alternativas:

| # | ID Expansão | ID Ativo | Especialidade Ativa | Tipo Match | Score Enunciado | Score Alternativas | Gabarito Exp / Ativo | Trecho do Enunciado |
| :-: | :-: | :---: | :---: | :---: | :-: | :-: | :-: | :--- |
| **1** | `242` | `941d09ba-9236-43aa-b993-e9d73dd0b8ca` | medicina_preventiva | `PREFIX_FUZZY_85` | 90.58% | 96.47% | **A** / **** | *Um novo tratamento para uma doença não-infecciosa, capaz de evitar a morte, mas não de levar à cura, ocasionará, no comp...* |
| **2** | `456` | `b8aeea1d-e615-4af5-b10e-b08145f8f8a3` | cirurgia | `EXACT_HASH` | 100.0% | 100.0% | **D** / **D** | *A hérnia de Spiegel:...* |
| **3** | `761` | `afbf6009-b76d-43ad-8d25-98eb8f2493ea` | clinica_medica | `EXACT_HASH` | 100.0% | 100.0% | **A** / **A** | *São causas de alcalose metabólica todas as assertivas abaixo, exceto:...* |
| **4** | `1520` | `60156fa0-51e2-404b-b6ce-2cbf28029e0d` | medicina_preventiva | `EXACT_HASH` | 100.0% | 100.0% | **E** / **** | *Assinale a CORRETA:
...* |
| **5** | `1795` | `a3fc841c-23aa-4e93-8656-63c763c98957` | cirurgia | `EXACT_HASH` | 100.0% | 100.0% | **B** / **B** | *Retocolectomia abdominoperineal com abaixamento retrorretal e anastomose colorretal  retardada é conhecida como cirurgia...* |
| **6** | `2232` | `c8d0732e-4104-4c8f-9499-6a28776f7a80` | medicina_preventiva | `EXACT_HASH` | 100.0% | 100.0% | **A** / **A** | *A Atenção Básica tem como fundamentos, EXCETO:...* |
| **7** | `2959` | `89ac9922-ec4f-4183-933f-e7af3076aee3` | clinica_medica | `EXACT_HASH` | 100.0% | 100.0% | **D** / **** | *Assinale o item correto:...* |
| **8** | `2967` | `da4ac9b3-53f4-49fe-80d2-63ef8fb0ce87` | clinica_medica | `EXACT_HASH` | 100.0% | 100.0% | **D** / **D** | *Mulher de 85 anos, hipertensa, com fibrilação atrial (FA) permanente, recentemente internada por insuficiência cardíaca....* |
| **9** | `2983` | `9ac27339-77c3-4936-aea7-cb7123ad5ec1` | pediatria | `PREFIX_FUZZY_85` | 87.29% | 100.0% | **B** / **B** | *A anorexia nervosa é caracterizada pela recusa do (a) paciente em manter a forma e o peso corporais minimamente normais ...* |
| **10** | `2991` | `c7c02098-af1e-4365-b089-0fb8f4a6f956` | clinica_medica | `EXACT_HASH` | 100.0% | 100.0% | **D** / **D** | *Homem 25 anos, trabalhador braçal, vem aos seus cuidados médicos e relata ser portador de comportamento aberrante, o qua...* |

---

## 5. Garantia de Segurança e Isolamento
- **Banco Ativo de Produção:** Os 6 arquivos JSON foram lidos em modo estritamente *read-only*. Nenhuma alteração foi realizada neles.
- **Backup de Segurança:** Preservado em `data/bancos_organizados_staging/backups/residencia_acesso_direto_pre_cruzamento.db`.
- **Rastreabilidade Total:** A tabela `staging_residencia_matches_com_ativo` dentro de `residencia_acesso_direto.db` mantém o histórico de cada questão removida e seu respectivo vínculo com a questão correspondente no banco ativo.
