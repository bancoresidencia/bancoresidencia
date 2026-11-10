# Relatório Final: Recruzamento e Deduplicação dos Bancos de Expansão

**Data de Execução:** 2026-11-09 11:39:36
**Tempo Total de Processamento:** 420.61 segundos (7.01 minutos)
**Ambiente:** 100% Local / Offline-First (Nenhum upload foi enviado ao Supabase)

---

## 1. Resumo Consolidado de Todas as Tabelas

| Banco de Expansão | Total Inicial | Duplicatas Removidas | Sobra Líquida | % Purga | ENARE Removidas |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Título de Especialista** (`titulo_especialista.db`) | 870 | 13 | **857** | 1.5% | 0 |
| **Revalida** (`revalida.db`) | 4,429 | 2,964 | **1,465** | 66.9% | 1 |
| **R+ Especialidades** (`r_plus.db`) | 50,582 | 5,527 | **45,055** | 10.9% | 7 |
| **Residência Médica (Acesso Direto)** (`residencia_acesso_direto.db`) | 64,531 | 15,048 | **49,483** | 23.3% | 58 |
| **TOTAL GERAL CONSOLIDADO** | **120,412** | **23,552** | **96,860** | **19.6%** | **66** |

---

## 2. Detalhamento por Base de Dados

### 2.1 Título de Especialista (`titulo_especialista.db`)
- **Volume Inicial:** 870 questões
- **Duplicatas Confirmadas:** 13 questões
- **Sobra Líquida Aprovada:** 857 questões
- **Questões ENARE Expurgadas:** 0

**Distribuição por Critério de Match:**
| Critério de Detecção | Quantidade | Descrição |
| :--- | :---: | :--- |
| `FUZZY_GABARITO_RETIFICADO` | 6 | Similaridade >= 85% com gabarito retificado |
| `EXACT_OPTIONS_HASH` | 3 | Conjunto das 4 ou 5 alternativas 100% idêntico |
| `EXACT_STATEMENT_HASH` | 2 | Enunciado rigorosamente idêntico (Hash SHA/FNV) |
| `FUZZY_MULTI_SIGNAL_85` | 1 | Similaridade textual >= 85% + congruência de alternativas |
| `EXACT_HASH_GABARITO_RETIFICADO` | 1 | Hash exato com gabarito corrigido por retificação oficial |

**Amostra de Rastreabilidade e Auditoria (Primeiras da Base):**
| ID Staging | Código Ativo | Score Enunc. | Score Opções | Motivo | Gab. Exp. | Gab. Ativo |
| :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| `61974` | `CERMAM-2026-GIN-0468` | 85.6% | 100.0% | `EXACT_OPTIONS_HASH` | C | A |
| `69045` | `AFAMCI-2026-OBS-13701` | 99.0% | 100.0% | `FUZZY_GABARITO_RETIFICADO` | C | B |
| `69057` | `AFAMCI-2026-OBS-13697` | 99.3% | 100.0% | `FUZZY_GABARITO_RETIFICADO` | A | E |
| `134637` | `INEPREVALIDA-2011-CLM-37558` | 99.9% | 100.0% | `EXACT_OPTIONS_HASH` | E | A |
| `150273` | `CERMAM-2025-GIN-12226` | 88.1% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | C | B |
| `150276` | `FACULDADEDEM-2024-MPS-13374` | 96.2% | 100.0% | `FUZZY_MULTI_SIGNAL_85` | C |  |
| `150298` | `CERMAM-2026-GIN-1800` | 99.1% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | B | C |
| `150330` | `FACULDADEDEM-2024-OBS-9384` | 99.5% | 100.0% | `FUZZY_GABARITO_RETIFICADO` | D | B |

---

### 2.2 Revalida (`revalida.db`)
- **Volume Inicial:** 4,429 questões
- **Duplicatas Confirmadas:** 2,964 questões
- **Sobra Líquida Aprovada:** 1,465 questões
- **Questões ENARE Expurgadas:** 1

**Distribuição por Critério de Match:**
| Critério de Detecção | Quantidade | Descrição |
| :--- | :---: | :--- |
| `EXACT_STATEMENT_HASH` | 1,633 | Enunciado rigorosamente idêntico (Hash SHA/FNV) |
| `EXACT_OPTIONS_HASH` | 824 | Conjunto das 4 ou 5 alternativas 100% idêntico |
| `FUZZY_MULTI_SIGNAL_85` | 274 | Similaridade textual >= 85% + congruência de alternativas |
| `EXACT_HASH_GABARITO_RETIFICADO` | 117 | Hash exato com gabarito corrigido por retificação oficial |
| `EXACT_HASH_ANULADA_RECONCILED` | 74 | Hash exato onde uma base marcava ANULADA |
| `FUZZY_GABARITO_RETIFICADO` | 29 | Similaridade >= 85% com gabarito retificado |
| `FUZZY_ANULADA_RECONCILED` | 13 | Similaridade >= 85% com questão ativa anulada |

**Amostra de Rastreabilidade e Auditoria (Primeiras da Base):**
| ID Staging | Código Ativo | Score Enunc. | Score Opções | Motivo | Gab. Exp. | Gab. Ativo |
| :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| `5034` | `INEPREVALIDA-2011-CIR-20889` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | E | E |
| `5035` | `INEPREVALIDA-2011-PED-23690` | 99.5% | 100.0% | `EXACT_OPTIONS_HASH` | B | B |
| `5036` | `INEPREVALIDA-2011-CIR-20897` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | A | A |
| `5037` | `INEPREVALIDA-2011-PED-23699` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | D | D |
| `5038` | `INEPREVALIDA-2011-CIR-20900` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | A | A |
| `5039` | `INEPREVALIDA-2011-PED-23704` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | B | B |
| `5040` | `INEPREVALIDA-2011-PED-23708` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | E | E |
| `5041` | `INEPREVALIDA-2011-CIR-20891` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | C | C |

---

### 2.3 R+ Especialidades (`r_plus.db`)
- **Volume Inicial:** 50,582 questões
- **Duplicatas Confirmadas:** 5,527 questões
- **Sobra Líquida Aprovada:** 45,055 questões
- **Questões ENARE Expurgadas:** 7

**Distribuição por Critério de Match:**
| Critério de Detecção | Quantidade | Descrição |
| :--- | :---: | :--- |
| `EXACT_STATEMENT_HASH` | 3,692 | Enunciado rigorosamente idêntico (Hash SHA/FNV) |
| `EXACT_OPTIONS_HASH` | 917 | Conjunto das 4 ou 5 alternativas 100% idêntico |
| `EXACT_HASH_GABARITO_RETIFICADO` | 400 | Hash exato com gabarito corrigido por retificação oficial |
| `FUZZY_MULTI_SIGNAL_85` | 290 | Similaridade textual >= 85% + congruência de alternativas |
| `FUZZY_GABARITO_RETIFICADO` | 153 | Similaridade >= 85% com gabarito retificado |
| `EXACT_HASH_ANULADA_RECONCILED` | 68 | Hash exato onde uma base marcava ANULADA |
| `FUZZY_ANULADA_RECONCILED` | 7 | Similaridade >= 85% com questão ativa anulada |

**Amostra de Rastreabilidade e Auditoria (Primeiras da Base):**
| ID Staging | Código Ativo | Score Enunc. | Score Opções | Motivo | Gab. Exp. | Gab. Ativo |
| :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| `22574` | `UFMAHUUFMA-2016-CIR-16116` | 100.0% | 100.0% | `EXACT_STATEMENT_HASH` | D | D |
| `22575` | `UFMAHUUFMA-2016-CIR-6134` | 98.1% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | C | D |
| `22586` | `UFMAHUUFMA-2015-CIR-17799` | 98.9% | 60.0% | `FUZZY_MULTI_SIGNAL_85` | D | D |
| `22591` | `UFMAHUUFMA-2020-CLM-17892` | 98.8% | 100.0% | `EXACT_OPTIONS_HASH` | ANULADA | ANULADA |
| `22617` | `UFMAHUUFMA-2020-CLM-17506` | 95.2% | 100.0% | `EXACT_OPTIONS_HASH` | B | A |
| `22618` | `UFMAHUUFMA-2020-CLM-3774` | 99.2% | 100.0% | `EXACT_OPTIONS_HASH` | A | C |
| `22619` | `UFMAHUUFMA-2020-CLM-28257` | 99.6% | 100.0% | `EXACT_OPTIONS_HASH` | A | C |
| `22620` | `UFMAHUUFMA-2020-CLM-4284` | 98.6% | 100.0% | `EXACT_OPTIONS_HASH` | B | C |

---

### 2.4 Residência Médica (Acesso Direto) (`residencia_acesso_direto.db`)
- **Volume Inicial:** 64,531 questões
- **Duplicatas Confirmadas:** 15,048 questões
- **Sobra Líquida Aprovada:** 49,483 questões
- **Questões ENARE Expurgadas:** 58

**Distribuição por Critério de Match:**
| Critério de Detecção | Quantidade | Descrição |
| :--- | :---: | :--- |
| `EXACT_HASH_GABARITO_RETIFICADO` | 5,499 | Hash exato com gabarito corrigido por retificação oficial |
| `EXACT_OPTIONS_HASH` | 4,286 | Conjunto das 4 ou 5 alternativas 100% idêntico |
| `EXACT_HASH_ANULADA_RECONCILED` | 2,840 | Hash exato onde uma base marcava ANULADA |
| `FUZZY_MULTI_SIGNAL_85` | 959 | Similaridade textual >= 85% + congruência de alternativas |
| `FUZZY_GABARITO_RETIFICADO` | 744 | Similaridade >= 85% com gabarito retificado |
| `EXACT_STATEMENT_HASH` | 490 | Enunciado rigorosamente idêntico (Hash SHA/FNV) |
| `FUZZY_ANULADA_RECONCILED` | 220 | Similaridade >= 85% com questão ativa anulada |
| `ENARE_BLOCK_MATCH` | 6 | Filtro dedicado contra as 704 questões ativas do ENARE |
| `ENARE_BLOCK_GABARITO_RECONCILED` | 4 | ENARE idêntico com gabarito retificado/preliminar reconciliado |

**Amostra de Rastreabilidade e Auditoria (Primeiras da Base):**
| ID Staging | Código Ativo | Score Enunc. | Score Opções | Motivo | Gab. Exp. | Gab. Ativo |
| :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| `56` | `UNIVERSIDADE-2017-CLM-13156` | 97.6% | 100.0% | `FUZZY_GABARITO_RETIFICADO` | C | B |
| `74` | `HOC-2016-PED-18606` | 91.7% | 125.0% | `FUZZY_GABARITO_RETIFICADO` | E | D |
| `226` | `HOA-2021-CLM-28884` | 100.0% | 0.0% | `EXACT_STATEMENT_HASH` | B | A |
| `397` | `SUSSP-2018-CLM-31290` | 89.0% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | A | E |
| `411` | `CEPOA-2019-MPS-5041` | 89.9% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | C | B |
| `422` | `UFRNHUOL-2019-GIN-0363` | 86.1% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | A | C |
| `477` | `SMSVOLTAREDO-2018-CLM-14181` | 91.4% | 75.0% | `FUZZY_GABARITO_RETIFICADO` | A | D |
| `511` | `OFTALMOCLNIC-2015-PED-3538` | 92.6% | 100.0% | `FUZZY_MULTI_SIGNAL_85` | D | D |

---

## 3. Conformidade com as Diretrizes do Usuário

1. **Backup Pré-Execução Garantido:** Cópia integral e verificada criada em `data/bancos_organizados_staging/backups_pre_recruzamento_2026/`.
2. **Supabase Preservado:** Zero conexões de escrita ou upload para o Supabase. Todas as tabelas ativas e de expansão em produção permaneceram 100% intactas.
3. **Rastreabilidade Total:** Cada questão excluída teve seu `id_staging` e o ID/código correspondente na base ativa salvos na tabela `staging_matches_com_ativo` do respectivo banco SQLite.
