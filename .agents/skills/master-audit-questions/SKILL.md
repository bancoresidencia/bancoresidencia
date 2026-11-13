---
name: master-audit-questions
description: Hub Mestre de Auditoria, Governança e Orquestração do Banco de Questões. Governa a tabela questions_curated_staging em supabase_tables.db como Fonte Única da Verdade (Single Source of Truth - 254.190 questões curadas e consolidadas após conclusão das Frentes 1, 5 e 6 de Filtros, Instituições e Dificuldade), orientando os próximos chats satélites de padronização de imagens WebP e consolidação de gabaritos faltantes.
---

# Master Question Audit Hub — Governança e Saneamento do Acervo

Este documento define a arquitetura mestre de auditoria, governança e alinhamento metodológico para o saneamento integral do acervo do **Banco Residência**.

> [!IMPORTANT]
> **FONTE ÚNICA DA VERDADE (SINGLE SOURCE OF TRUTH - SSOT):**
> A tabela **`questions_curated_staging`** no banco [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db) é, a partir de agora, a **Fonte Única da Verdade (SSOT)** de todo o acervo (254.190 questões ativas). 
> Todos os próximos chats satélites de especialidade (imagens WebP, consolidação de gabaritos, comentários ouro) irão **ler, auditar e atualizar diretamente essa tabela**. As tabelas originais (`questions`, `questions_expansion_*` e `provaderesidencia_*`) permanecem preservadas como linha de base imutável para rastreabilidade histórica.

---

## 🎯 1. Propósito e Papel do Chat Mestre

O **Chat Mestre** atua como a **Torre de Controle**:
1. **Governança da SSOT (`questions_curated_staging`):** Centralizar as métricas de integridade, schemas e quality gates consolidados.
2. **Definição de Especificações para Chats Especialistas:** Fornecer os contratos de dados, regras clínicas e diretrizes técnicas para cada chat satélite.
3. **Orquestração Multi-Chat:** Cada frente de trabalho roda em seu próprio chat dedicado com contexto limpo e especializado:
   * *Frente 1:* Deduplicação e Preservação de Filtros (**CONCLUÍDA E HOMOLOGADA**)
   * *Frente 5 (Filtros):* Normalização de Bancas, Instituições e Modalidade (**CONCLUÍDA E HOMOLOGADA**)
   * *Frente 6 (Filtros):* Calibração de Dificuldade Vetorial/k-NN (**CONCLUÍDA E HOMOLOGADA**)
   * *Frente 2:* Padronização de Imagens em WebP (**PRÓXIMO PASSO**)
   * *Frente 3:* Consolidação de Gabaritos Faltantes (**PRÓXIMO PASSO**)
   * *Frente 4:* Comentários Padrão-Ouro via API
4. **Homologação e Integração Consolidada no Supabase:** Executada com sucesso absoluto! A SSOT foi sincronizada com preservação integral dos comentários Padrão-Ouro e histórico cumulativo do Revalida, totalizando **257.111 questões ativas** nas 4 tabelas consolidadas (`questions_direto`, `questions_rplus`, `questions_revalida`, `questions_titulo`) e suas respectivas views públicas.

---

## 📊 2. Status Geral do Pipeline de Saneamento

```
                              ┌──────────────────────────────────────────────────┐
                              │     MASTER AUDIT HUB (Chat & Skill Mestre)       │
                              │  SSOT: questions_curated_staging (254.190 q)     │
                              └────────────────────────┬─────────────────────────┘
                                                       │
         ┌─────────────────────┬───────────────────────┼─────────────────────────┬─────────────────────┐
         ▼                     ▼                       ▼                         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐   ┌────────────────────┐    ┌──────────────────┐  ┌──────────────────┐
│ 1. DEDUPLICAÇÃO  │  │   2. IMAGENS     │   │    3. GABARITOS    │    │  4. COMENTÁRIOS  │  │ 5. INSTITUIÇÕES  │
│   & FILTROS      │  │      WebP        │   │    PADRÃO-OURO     │    │     API OURO     │  │ & MODALIDADES    │
│  [✅ HOMOLOGADA] │  │ [⏳ PRÓXIMO CHAT]│   │  [⏳ PRÓXIMO CHAT] │    │  [⏸️ AGUARDANDO] │  │  [✅ HOMOLOGADA] │
└──────────────────┘  └──────────────────┘   └────────────────────┘    └──────────────────┘  └──────────────────┘
                                                       │
                                                       ▼
                                             ┌────────────────────┐
                                             │   6. DIFICULDADE   │
                                             │    (VETORIAL/TRI)  │
                                             │   [✅ HOMOLOGADA]  │
                                             └────────────────────┘
```

---

## 🛠️ 3. As 6 Frentes de Saneamento & Detalhamento Operacional

### 1️⃣ Frente 1: Deduplicação Absoluta & Preservação Canônica de Filtros
* **Status:** **CONCLUÍDA E HOMOLOGADA** via skill [`filter-correct-deduplication`](file:///d:/bancoresidencia/.agents/skills/filter-correct-deduplication/SKILL.md).
* **Resultado Consolidado:**
  * Universo Inicial Cruzado: **263.197 questões** (224.032 do Supabase + 39.165 da Coleta Parte 2).
  * Acervo Resultante na SSOT: **254.192 questões ativas e distintas**:
    * `distinct_single`: **213.803** (84,11%) — questões únicas catalogadas.
    * `distinct_temporal_or_independent`: **31.432** (12,37%) — questões com enunciados próximos porém com variações temporais/parâmetros clínicos distintos confirmados.
    * `curated_merged`: **8.957** (3,52%) — fusões inteligentes executadas com absorção dos metadados mais ricos (comentários longos, imagens, focos detalhados e numeração oficial de prova).
  * Hashes e linhagem preservados via colunas `merged_from_ids` e `source_tables`.

---

### 2️⃣ Frente 2: Engenharia de Imagens WebP & Vínculo Determinístico
* **Status:** **EM PREPARAÇÃO (PRÓXIMO CHAT DEDICADO)**.
* **Escopo na SSOT (`questions_curated_staging`):**
  * Converter 100% das imagens pendentes para o padrão **`.webp`**.
  * Auditar os links existentes e vincular o acervo de **1.136 imagens** locais extraídas de `provaderesidencia_imagens_arquivo`.
  * Garantir inserção de tags explícitas de imagem (`[IMAGEM 1]`, `[IMAGEM 2]`) no corpo do enunciado quando referenciadas no texto clínico.
  * Certificar que nenhuma imagem retorne erro 403/404 ou use links temporários com expiração.

---

### 3️⃣ Frente 3: Homologação Padrão-Ouro de Gabaritos Faltantes
* **Status:** **EM PREPARAÇÃO (PRÓXIMO CHAT DEDICADO)**.
* **Escopo na SSOT (`questions_curated_staging`):**
  * Auditar todas as questões que constam sem gabarito ou com gabaritos preliminares/suspeitos.
  * Cruzar com os cadernos oficiais de prova em [`data/official_exams/`](file:///d:/bancoresidencia/data/official_exams/) e no catálogo de gabaritos nacionais para resolução definitiva.
  * Homologar anulações oficiais (`is_anulada = true`, `correct_answer = 'ANULADA'`).
  * Tratar questões dissertativas/discursivas vinculando seus espelhos de correção oficiais e palavras-chave esperadas.

---

### 4️⃣ Frente 4: Produção & Curadoria de Comentários Médicos via API Ouro
* **Status:** **AGUARDANDO CONCLUSÃO DAS FRENTES 2 E 3**.
* **Objetivo:** Gerar e aprofundar as justificativas das assertivas (com destaque em **negrito** no ponto de erro), resumo fisiopatológico e Take-Home Message pelo protocolo do `professor-questoes-medicas`, sanitizando qualquer menção comercial antitruste.

---

### 5️⃣ Frente 5: Padronização Canônica de Instituições, Bancas & Modalidade
* **Status:** **CONCLUÍDA E HOMOLOGADA NO ÂMBITO DE FILTROS** via script [`scripts/standardize_institutions_and_bancas.py`](file:///d:/bancoresidencia/scripts/standardize_institutions_and_bancas.py) e [`scripts/standardize_modalidades.py`](file:///d:/bancoresidencia/scripts/standardize_modalidades.py).
* **Resultados Consolidados:**
  * **Modalidades:** 100% canônicas (206.599 Acesso Direto, 45.413 R+, 1.490 Revalida, 688 Título de Especialista; zero nulos).
  * **Expurgo de Testes:** 2 questões de teste ('InocencioJunior') eliminadas. Acervo ajustado para **254.190 questões ativas**.
  * **Despoluição Institucional:** >100.000 questões limpas de sufixos prolixos `[SIGLA] - [NOME EXTENSO] ([UF])`.
  * **Subdivisões Oficiais Preservadas:** `USP-SP` (4.773 q) e `USP-RP` (3.314 q) mantidas independentes; `SUS-SP` (2.439 q) vs `SMS-SP` (1.009 q) segregados; `UFG` (2.308 q) vs `UFGD` (687 q) preservados.
  * **Slugs de URL e Tags Duplicadas:** 0 slugs em PascalCase e 0 tags `DUPLICADO` residuais.

---

### 6️⃣ Frente 6: Calibração de Dificuldade Vetorial (TRI) & Taxonomia
* **Status:** **CONCLUÍDA E HOMOLOGADA NO ÂMBITO DE DIFICULDADE** via script [`scripts/classify_difficulty_vector.py`](file:///d:/bancoresidencia/scripts/classify_difficulty_vector.py).
* **Resultados Consolidados:**
  * **Preenchimento de Nulos:** 100% das 30.599 questões `NULL` classificadas via modelo híbrido em 3 camadas:
    1. Camada 1 (Gêmeas Exatas Homólogas): 15.780 questões (51,57%).
    2. Camada 2 (Vector Space k-NN com Cosseno Ponderado): 4.689 questões (15,32%).
    3. Camada 3 (Heurística Cognitiva Clínica de Complexidade): 10.130 questões (33,11%).
  * **Distribuição Final Canônica:** `Médio` (171.410 - 67,43%), `Fácil` (57.510 - 22,62%), `Difícil` (25.270 - 9,94%), Zero Nulos.

---

## 🔒 4. Regras de Governança para os Próximos Chats

1. **Acesso Exclusivo à SSOT:** Todos os novos chats especialistas devem operar sobre a tabela `questions_curated_staging` do arquivo [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db).
2. **Atualizações com Checkpoint e Rastreabilidade:** Qualquer alteração em lote de imagens ou gabaritos deve registrar logs detalhados e manter checkpoints para reversão segura caso necessário.
3. **Imutabilidade das Tabelas Brutas:** As tabelas de importação originais (`questions`, `questions_expansion_*`, `provaderesidencia_*`) não devem sofrer alterações diretas.
4. **Fechamento e Reingestão:** Apenas o Chat Mestre fará o merge consolidado e a exportação final para os scripts de sincronização com o Supabase.

---

## 🌐 5. Estado Homologado no Supabase (Pós-Merge de Alta Precisão)

A integração consolidada da SSOT com o Supabase PostgreSQL foi executada e homologada com 100% de acurácia, preservando cumulativamente os comentários Padrão-Ouro LLM e o acervo histórico pré-existente do Revalida:

* **`questions_direto` (e `view_questions_acesso_direto`):** **206.599 questões** (100% auditadas com enunciado limpo, opções A–E e filtros)
* **`questions_rplus` (e `view_questions_rplus`):** **45.413 questões**
* **`questions_revalida` (e `view_questions_revalida`):** **4.411 questões** (1.490 da SSOT curada + 2.921 registros legados preservados)
* **`questions_titulo` (e `view_questions_titulo`):** **688 questões**
* **TOTAL GLOBAL NO SUPABASE:** **257.111 questões ativas**
* **Comentários Padrão-Ouro LLM Preservados:** **86.318 comentários** intactos na nuvem.

