---
name: master-audit-questions
description: Hub Mestre de Auditoria, Governança e Orquestração do Banco de Questões. Governa a tabela questions_curated_staging em supabase_tables.db como Fonte Única da Verdade (Single Source of Truth - 254.192 questões curadas e consolidadas após conclusão da Frente 1 de Deduplicação), orientando os próximos chats satélites de padronização de imagens WebP e consolidação de gabaritos faltantes.
---

# Master Question Audit Hub — Governança e Saneamento do Acervo

Este documento define a arquitetura mestre de auditoria, governança e alinhamento metodológico para o saneamento integral do acervo do **Banco Residência**.

> [!IMPORTANT]
> **FONTE ÚNICA DA VERDADE (SINGLE SOURCE OF TRUTH - SSOT):**
> A tabela **`questions_curated_staging`** no banco [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db) é, a partir de agora, a **Fonte Única da Verdade (SSOT)** de todo o acervo. 
> Todos os próximos chats satélites de especialidade (imagens WebP, consolidação de gabaritos, comentários ouro, filtros) irão **ler, auditar e atualizar diretamente essa tabela**. As tabelas originais (`questions`, `questions_expansion_*` e `provaderesidencia_*`) permanecem preservadas como linha de base imutável para rastreabilidade histórica.

---

## 🎯 1. Propósito e Papel do Chat Mestre

O **Chat Mestre** atua como a **Torre de Controle**:
1. **Governança da SSOT (`questions_curated_staging`):** Centralizar as métricas de integridade, schemas e quality gates consolidados.
2. **Definição de Especificações para Chats Especialistas:** Fornecer os contratos de dados, regras clínicas e diretrizes técnicas para cada chat satélite.
3. **Orquestração Multi-Chat:** Cada frente de trabalho roda em seu próprio chat dedicado com contexto limpo e especializado:
   * *Frente 1:* Deduplicação e Preservação de Filtros (**CONCLUÍDA**)
   * *Frente 2:* Padronização de Imagens em WebP (**PRÓXIMO PASSO**)
   * *Frente 3:* Consolidação de Gabaritos Faltantes (**PRÓXIMO PASSO**)
   * *Frente 4:* Comentários Padrão-Ouro via API
   * *Frente 5:* Normalização de Bancas e Instituições
   * *Frente 6:* Calibração de Dificuldade (TRI) e Taxonomia
4. **Homologação e Reingestão Final:** Após a conclusão dos quality gates de todas as frentes sobre `questions_curated_staging`, este Hub Mestre coordenará a exportação e sincronização definitiva para as tabelas de produção do Supabase.

---

## 📊 2. Status Geral do Pipeline de Saneamento

```
                              ┌──────────────────────────────────────────────────┐
                              │     MASTER AUDIT HUB (Chat & Skill Mestre)       │
                              │  SSOT: questions_curated_staging (254.192 q)     │
                              └────────────────────────┬─────────────────────────┘
                                                       │
         ┌─────────────────────┬───────────────────────┼─────────────────────────┬─────────────────────┐
         ▼                     ▼                       ▼                         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐   ┌────────────────────┐    ┌──────────────────┐  ┌──────────────────┐
│ 1. DEDUPLICAÇÃO  │  │   2. IMAGENS     │   │    3. GABARITOS    │    │  4. COMENTÁRIOS  │  │ 5. INSTITUIÇÕES  │
│   & FILTROS      │  │      WebP        │   │    PADRÃO-OURO     │    │     API OURO     │  │ & PROVAS INCOMP. │
│  [✅ HOMOLOGADA] │  │ [⏳ PRÓXIMO CHAT]│   │  [⏳ PRÓXIMO CHAT] │    │  [⏸️ AGUARDANDO] │  │  [⏸️ AGUARDANDO] │
└──────────────────┘  └──────────────────┘   └────────────────────┘    └──────────────────┘  └──────────────────┘
                                                       │
                                                       ▼
                                             ┌────────────────────┐
                                             │   6. DIFICULDADE   │
                                             │    & TAXONOMIA     │
                                             │   [⏸️ AGUARDANDO]  │
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

### 5️⃣ Frente 5: Padronização Canônica de Instituições, Bancas & Provas Incompletas
* **Status:** **AGUARDANDO CONCLUSÃO DAS FRENTES 2 E 3**.
* **Objetivo:** Normalizar nomes de bancas para os padrões oficiais (ex: unificar variações de USP, ENARE, UNICAMP), remover bancas genéricas ou atribuídas a cursinhos preparatórios e identificar cadernos oficiais incompletos para resgatar questões faltantes.

---

### 6️⃣ Frente 6: Calibração Taxonômica, Dificuldade TRI & Status
* **Status:** **AGUARDANDO CONCLUSÃO DAS FRENTES 2 E 3**.
* **Objetivo:** Calibrar a coluna `difficulty` para os níveis Fácil (~30%), Médio (~50%) e Difícil (~20%) para alimentar o motor psicométrico de TRI (`src/utils/irtModel.ts`), garantindo alinhamento fino de `especialidade`, `tema`, `foco` e `subfoco`.

---

## 🔒 4. Regras de Governança para os Próximos Chats

1. **Acesso Exclusivo à SSOT:** Todos os novos chats especialistas devem operar sobre a tabela `questions_curated_staging` do arquivo [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db).
2. **Atualizações com Checkpoint e Rastreabilidade:** Qualquer alteração em lote de imagens ou gabaritos deve registrar logs detalhados e manter checkpoints para reversão segura caso necessário.
3. **Imutabilidade das Tabelas Brutas:** As tabelas de importação originais (`questions`, `questions_expansion_*`, `provaderesidencia_*`) não devem sofrer alterações diretas.
4. **Fechamento e Reingestão:** Apenas o Chat Mestre fará o merge consolidado e a exportação final para os scripts de sincronização com o Supabase.
