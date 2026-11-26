# Plano Absoluto: Recuperação Local, Sincronização, Cruzamento e Implantação do Selo Padrão-Ouro no Supabase

**Base Técnica:** [RELATORIO_AUDITORIA_COMENTARIOS_PADRAO_OURO_SUPABASE_2026-11-25.md](file:///d:/bancoresidencia/docs/RELATORIO_AUDITORIA_COMENTARIOS_PADRAO_OURO_SUPABASE_2026-11-25.md)  
**Data:** 25 de novembro de 2026  
**Status:** Plano fechado conforme diretrizes do usuário (**nenhuma alteração executada até o momento**)

### Decisões Homologadas no Planejamento
1. **Lote 1B (44.443 sem justificativa após recuperação local):** Recuperar ao máximo os `options[].explanation` existentes localmente (Lote 1A) e, para as remanescentes sem justificativa local (Lote 1B), **flexibilizar o Selo Absoluto para aceitar os 3 pilares de corpo (`Comentário Final + Principal Motivo de Erro + Take-Home Message`)**, sem geração por IA nesta etapa.
2. **Demais Subgrupos Quase-Ouro (`661` Revalida sem Principal Erro, `151` apenas com `options[].explanation` sem `commentary` local, `92` sem Principal Erro, `17` legadas R+):** **Apenas rebaixar para `comentada_parcial`** (`has_gold_commentary = false`) nesta etapa, sem geração por IA.
3. **Detecção Semântica de Comentários Trocados (`pdr_*` e colisões de `code`):** **Incluir varredura semântica rápida** (`statement + options` vs `commentary`) para isolar casos trocados (como `pdr_70233` — *Exantema Súbito* com comentário de *Hiperpotassemia*) antes da selagem.

---

## 1. Objetivo Estratégico

Garantir que o banco de questões no Supabase possua **100% de fidelidade** entre o conteúdo real de cada questão e seu selo/filtro para o aluno, atingindo:
1. **Zero perda de produção já realizada:** Recuperar todas as justificativas (`options[].explanation`) e comentários já gerados nos arquivos locais/backups (especialmente para as **44.443** questões com Comentário Final + Principal Erro + Take-Home que hoje estão com `0/N` justificativas no Supabase).
2. **Preservação das 44.443 questões no universo Padrão-Ouro:** Assegurar o tratamento adequado (recuperação local + complementação eventual das remanescentes) para que não sejam perdidas nem rebaixadas injustamente.
3. **Selo Absoluto Único e Determinístico:** Unificar `commentary_tier`, `study_gold_fingerprint`, `study_question_index.has_gold_commentary` e o endpoint de fallback `/api/questions` sob uma única regra atômica sincronizada por trigger no PostgreSQL.

---

## 2. Visão Geral das Fases

```
[Fase 0: Backup & Blindagem de Scripts]
        │
        ▼
[Fase 1: Varredura Local Forense (Read-Only)]
  • Busca em *_final_questions.json, *_direto_questions.json,
    questions.json, SQLite staging/backups e tabela legada `questions`
  • Match estrito por UUID + validação de enunciado/opções (zero colisão de code)
  • Separação: Lote 1A (recuperado 100% local) vs Lote 1B (sem justificativa local)
        │
        ▼
[Fase 2: Saneamento & Sincronização Segura Local -> Supabase]
  • Mesclagem best-of-both (sem sobrescrever comentário existente por vazio)
  • Isolamento de comentários trocados detectados na varredura semântica (ex.: pdr_70233)
  • Correção de anomalias estruturais (opções duplicadas, selo fantasma, HTML residual)
  • Lote 1B (sem justificativa local): preservado sem geração por IA nesta etapa
        │
        ▼
[Fase 3: Cruzamento & Implantação do Selo Absoluto (Migration SQL)]
  • Nova função canônica public.is_gold_standard_commentary(...) v2
    (4 pilares completos OU 3 pilares de corpo limpos do Lote 1B)
  • Rebaixamento dos demais subgrupos incompletos para 'comentada_parcial'
  • Trigger único atômico para commentary_tier + study_gold_fingerprint + has_gold_commentary
  • Backfill nas 4 tabelas canônicas e study_question_index
  • Atualização do filtro fallback em src/app/api/questions/route.ts
        │
        ▼
[Fase 4: Auditoria Final Pós-Execução (Quality Gate 0% Erro)]
  • Varredura completa confirmando 0% FP, 0% FN e 0 dessincronias em todos os subgrupos
```

---

## 3. Detalhamento Técnico por Fase

### Fase 0 — Congelamento, Backup e Correção Preventiva de Scripts
1. **Snapshot de Segurança Pré-Execução (somente leitura $\to$ disco local):**
   - Exportar do Supabase para `data/backups/pre_selo_absoluto_2026-11-25/` todas as colunas críticas (`id`, `code`, `correct_answer`, `is_anulada`, `has_gabarito`, `commentary`, `options`, `commentary_tier`, `study_gold_fingerprint`) das 4 tabelas canônicas (`questions_direto`, `questions_rplus`, `questions_revalida`, `questions_titulo`) e `study_question_index`.
2. **Correção Preventiva dos Scripts de Sync (para não reincidir o bug):**
   - Corrigir [`produce_specialty_batch.mjs`](file:///d:/bancoresidencia/scripts/produce_specialty_batch.mjs#L300-L304) e [`sync_gold_to_questions_direto.mjs`](file:///d:/bancoresidencia/scripts/sync_gold_to_questions_direto.mjs#L81-L85) para:
     - Atualizar **sempre** `commentary` **e** `options` juntos no SQLite local (`questions_curated_staging`).
     - **Remover** o filtro perigoso `OR code = ?` nos `UPDATE`s (que causava colisões entre códigos compartilhados como `PDR-Q59`), mantendo vínculo estrito por PK `id`.
   - Corrigir [`sync_supabase_commentaries_to_sqlite.mjs`](file:///d:/bancoresidencia/scripts/sync_supabase_commentaries_to_sqlite.mjs#L44) para incluir `options` no snapshot de backup.

---

### Fase 1 — Varredura Forense Local & Recuperação das Justificativas (Read-Only $\to$ Staging Local)
*Meta: Descobrir exatamente quantas das **44.443** questões sem justificativa (e das **151** sem `commentary`, além dos **14.986** FNs) têm seus dados íntegros preservados localmente.*

1. **Fontes Locais e Legadas a Varrer (em ordem de prioridade de confiabilidade):**
   - **Camada 1 — JSONs Finais e Direto por Especialidade:**
     - `data/pediatria_final_questions.json` e `data/pediatria_direto_questions.json`
     - `data/clinica_medica_final_questions.json` e `data/clinica_direto_questions.json`
     - `data/ginecologia_final_questions.json` e `data/ginecologia_direto_questions.json`
     - `data/obstetricia_final_questions.json` e `data/obstetricia_direto_questions.json`
     - `data/cirurgia_final_questions.json` e `data/cirurgia_direto_questions.json`
     - `data/medicina_preventiva_final_questions.json`, `data/urologia_final_questions.json`, `data/nefrologia_final_questions.json`
   - **Camada 2 — Consolidações e Backups Locais:**
     - `data/all_homologated_questions_gold.json`
     - `data/backups/pre_avc_hemorragico_*.json`, `data/backups_pre_retificacao_20261101/*`, `data/backups_pre_correcao_gabaritos_2026/*`, `data/backups_pre_correcao/*`
     - `data/supabase_tables/supabase_tables.db` (`questions_curated_staging`, `questions_curated_staging_pre_images_backup`, `supabase_live_commentaries`)
     - `data/questions.json` e `data/questions_expansion_*.json`
   - **Camada 3 — Tabela Legada no Supabase (`public.questions`, read-only):**
     - Verificar se há `options[].explanation` ainda preservado na tabela legada `questions` (`130.024` linhas) para os IDs das 44.443 questões que não forem encontrados nas Camadas 1 e 2.
2. **Protocolo Anti-Colisão no Match Local $\leftrightarrow$ Supabase:**
   - Pareamento primário exclusivamente por **UUID normalizado** (removendo prefixos `questions_` / `questions_expansion_direto_` / `expansion_direto_`).
   - **Trava semântica obrigatória antes de aceitar qualquer `options[].explanation` ou `commentary` local:**
     - Quantidade de alternativas e letras (`A–E`) compatíveis;
     - Similaridade mínima de texto ($\ge 0,75$) entre `statement` e entre os textos das alternativas (`options[].text`) para evitar qualquer desalinhamento histórico;
     - Preferência pela versão de `options` que tiver maior número de explicações não genéricas ($\ge 10$ chars), e nunca aceitar explicações de fallback genérico (`"Alternativa incorreta. Esta afirmativa diverge..."`) se houver explicação real.
3. **Auditoria Semântica de Comentários Trocados (`PDR` e similares):**
   - Varrer questões com histórico de colisão de `code` (especialmente prefixos `pdr_*` e registros com baixo overlap de palavras-chave entre `statement` + `options` e `commentary`, como o caso detectado `pdr_70233` — *Exantema Súbito* com comentário de *Hiperpotassemia*).
   - Gerar lista auditável separada dos casos com suspeita de comentário trocado para saneamento antes da selagem.
4. **Saída da Fase 1 (Relatório de Recuperação Local):**
   - Contagem exata e arquivo de staging consolidado dividindo as **44.443** em:
     - **Lote 1A:** Questões cuja justificativa `N/N` foi **recuperada integralmente** do acervo local/legado.
     - **Lote 1B:** Questões cujas justificativas **não existem** em nenhum arquivo local/legado (candidatas à geração pontual apenas de `optionExplanations` ou critério definido pelo usuário).

---

### Fase 2 — Sincronização Local $\to$ Supabase & Saneamento Estrutural
1. **Sincronização do Lote 1A (`options[].explanation` recuperadas) e de Eventuais Comentários Locais Mais Completos:**
   - Aplicar `UPDATE` em lotes controlados nas tabelas canônicas do Supabase (`questions_direto`, `questions_rplus`, `questions_revalida`, `questions_titulo`) atualizando apenas os registros validados na Fase 1.
   - Espelhar a atualização em `data/supabase_tables/supabase_tables.db` (`questions_curated_staging`) gravando **`commentary` e `options` juntos**, mantendo 100% de congruência local $\leftrightarrow$ remoto.
2. **Tratamento do Lote 1B (remanescentes sem `options[].explanation` local):**
   - **Sem geração por IA nesta etapa.** Os comentários já produzidos (Comentário Final + Principal Motivo de Erro + Take-Home Message) permanecem preservados e elegíveis ao Selo Absoluto pela regra flexibilizada aprovada para os 3 pilares, mantendo registro em log local das questões do Lote 1B para eventual complementação futura de justificativas por alternativa.
3. **Saneamento Cirúrgico das Anomalias Estruturais Identificadas na Auditoria:**
   - **Comentários trocados por colisão (`pdr_70233`, `pdr_54583` e demais identificados na varredura semântica):** isolar/limpar os registros incompatíveis (ou restaurar o texto correto caso exista em `provaderesidencia_questoes`/backups) para que nunca recebam o Selo Absoluto com conteúdo de outra questão.
   - **Duplicação de opções no Revalida (`2` casos: `EXP-REV-180644`, `EXP-REV-180628`):** deduplicar o array `options` de `8` para `4` opções únicas preservando as explicações.
   - **Selo fantasma em discursiva vazia (`1` caso: `bc3d62c5-02cd-53ff-be44-4217bda629c9`):** limpar `commentary_tier` e `study_gold_fingerprint`.
   - **Tags HTML residuais (`174` casos):** sanitizar `<p>`, `<br>`, `<u>` para Markdown canônico.
   - **Divergência letra vs. texto (`2` casos: `HMG-2017-CIR-10405`, `CERMAM-2018-CIR-18054`) e `198` discursivas marcadas como `ANULADA`:** listar para revisão de curadoria humana sem alterar gabaritos automaticamente.
   - **Demais subgrupos parciais (`661` Revalida com `💡 Take-Home` sem Principal Erro, `151` com `options[].explanation` mas `commentary = ""` sem recuperação local, `92` sem Principal Erro, `17` legadas R+ com `"Olá, estudante!"`):** mantidos sem geração por IA e classificados como `'comentada_parcial'` (`has_gold_commentary = false`) na Fase 3.

---

### Fase 3 — Cruzamento Final & Implantação do **Selo Absoluto** (Supabase + Frontend)
1. **Alinhamento Preventivo do Parser (`QuestionCard.tsx`):**
   - Manter compatibilidade no [`QuestionCard.tsx`](file:///d:/bancoresidencia/src/components/QuestionCard.tsx#L870-L920) (e aceitar `💡` opcional para que mesmo questões `'comentada_parcial'` do Revalida renderizem o card de Take-Home corretamente).
2. **Nova Migration SQL do Selo Absoluto:**
   - **`public.is_gold_standard_commentary(p_commentary text, p_options jsonb, p_type text)` (v2):**
     - **Bloqueios absolutos (sempre `false`):** `commentary` vazio/nulo; JSON bruto (`{"_id":...}`); placeholder (`Gabarito não disponibilizado`, etc.); saudação legada (`Olá, estudante!`, `Fala, Estrategista`, `MEDOPEN`, `T.ME/`); `commentary` com corpo final vazio ou truncado sem os blocos obrigatórios.
     - **Obrigatoriedade conjunta (`AND`) dos 3 pilares de corpo em `commentary`:**
       1. `Comentário Final / Síntese Clínica` substantivo ($\ge 40$ chars após extrair blocos);
       2. `Take-Home Message` / `Pérola Prática` / `Pérola Clínica` presente e não vazio;
       3. `Principal Motivo de Erro` / `Armadilha da Questão` presente e não vazio.
     - **Justificativa (conforme decisão aprovada):**
       - *Discursivas / Dissertativas (ou anuladas sem opções):* Padrão de Resposta comentado / prosa clínica substantiva ($\ge 80$ chars).
       - *Objetivas com opções:* aceita tanto **100% das alternativas explicadas** (`Lote 1A` + `149k` já completas) quanto o formato legado de **3 pilares de corpo completos sem `options[].explanation` (`Lote 1B` das `44.443`)**, **rejeitando** qualquer caso com explicação parcial incompleta (`1/4` ou `2/4`) ou sem corpo de `commentary` (como os `151` casos com `commentary = ""` e os `661` do Revalida sem Principal Erro).
   - **Governo Unificado por Trigger (`sync_study_question_index` + trigger `BEFORE INSERT OR UPDATE` nas 4 tabelas):**
     - Sempre que uma questão for inserida ou tiver `commentary`, `options`, `type`, `correct_answer`, `is_anulada` ou `has_gabarito` alterados:
       - Recalcula `commentary_tier` atomicamente: `'padrao_ouro'` | `'comentada_parcial'` | `'sem_comentario'`.
       - Grava `study_gold_fingerprint` (SHA-256) **apenas** quando `commentary_tier = 'padrao_ouro'` (e `NULL` nos demais casos).
       - Sincroniza `study_question_index.has_gold_commentary = (NEW.commentary_tier = 'padrao_ouro')` para todas as linhas com `has_gabarito = true`.
   - **Backfill Integral:**
     - Recalcular `commentary_tier`, `study_gold_fingerprint` e `study_question_index.has_gold_commentary` em 100% das **257.090** linhas das 4 tabelas e **246.257** linhas do índice (em lotes/shards para evitar `statement_timeout`).
3. **Alinhamento do Fallback da API (`/api/questions`):**
   - Em [`src/app/api/questions/route.ts`](file:///d:/bancoresidencia/src/app/api/questions/route.ts#L555-L559), substituir o filtro `ilike` legado por `.eq('commentary_tier', 'padrao_ouro')` (garantindo paridade absoluta entre a RPC `query_study_questions` e o fallback privilegiado).

---

### Fase 4 — Auditoria Pós-Execução (Quality Gate)
- Reexecutar a auditoria read-only integral sobre o Supabase vivo validando:
  - **0 Falsos Positivos** e **0 Falsos Negativos** no filtro `has_gold_commentary` (`study_question_index`) e no selo `commentary_tier`.
  - **0 dessincronias** entre tabela canônica e `study_question_index`.
  - **0 regressões** nos subgrupos (Objetivas sem/com imagem, Discursivas sem/com imagem, Certo ou Errado, Anuladas).
  - Execução dos gates do projeto (`npm run lint && npm run build && npm test && npm run test:security`).
