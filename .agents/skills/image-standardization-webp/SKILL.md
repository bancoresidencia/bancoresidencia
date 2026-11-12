---
name: image-standardization-webp
description: Governança, auditoria profunda, triagem de marcas d'água de plataformas concorrentes, conversão universal para WebP e injeção determinística de tags de imagem nas questões da tabela questions_curated_staging (SSOT).
---

# Image Standardization WebP — Governança & Saneamento de Imagens

Este documento estabelece o protocolo de engenharia, governança, arquitetura de software e curadoria visual da **Frente 2 (Padronização de Imagens em WebP e Vínculo Determinístico)** sobre a Fonte Única da Verdade (**SSOT** — tabela `questions_curated_staging` em [`data/supabase_tables/supabase_tables.db`](file:///d:/bancoresidencia/data/supabase_tables/supabase_tables.db)).

> [!IMPORTANT]
> **DIRETRIZES MESTRES DE IMAGENS:**
> 1. **Padrão Obrigatório WebP:** Nenhuma imagem em produção deve permanecer em formato legado (`.jpg`, `.jpeg`, `.png`, `.bmp`, `.gif`, `.tiff`) ou com links externos instáveis.
> 2. **Tolerância Zero a Marcas d'Água de Concorrentes:** Nenhuma imagem do Banco Residência pode conter marcas d'água, logotipos, carimbos ou rodapés de plataformas terceiras (Medcurso, Medgrupo, Estratégia MED, Medway, Sanar, Hardwork, Prova de Residência, MedEvo, etc.).
> 3. **Dashboard no Localhost para Curadoria Visual:** Todo o andamento da triagem e aprovação de imagens de terceiros deve ser auditável em tempo real via dashboard local (`http://localhost:3336`).
> 4. **Auditoria Rigorosa de Gabaritos em Alternativas Visuais:** Questões cujas alternativas são imagens frequentemente sofrem inversões durante o scraping; é obrigatório re-auditar os gabaritos oficiais dessas assertivas.
> 5. **Resgate Ativo de Imagens Faltantes via Cadernos Locais e Web Search:** Enunciados com exames omitidos devem ter seus arquivos resgatados diretamente dos cadernos oficiais ou por busca na web.

---

## 🎯 1. Objetivos & Quality Gates da Frente de Imagens

O saneamento visual é governado por 6 Quality Gates sequenciais e auditáveis:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      PIPELINE DOS 6 QUALITY GATES DE IMAGENS                           │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌──────────────────────────────┐                              ┌──────────────────────────────┐
│ GATE 1: 100% WebP            │ ──► Converte 1.427 legados   │ GATE 2: Storage Próprio      │ ──► Elimina S3 e MedEvo;
│ (Lossless ECG & HQ Clínico)  │     (sharp, libvips, node)   │ (Zero links externos/mortos) │     unifica no Supabase
└──────────────┬───────────────┘                              └──────────────┬───────────────┘
               │                                                             │
               └───────────────────────────────┬─────────────────────────────┘
                                               ▼
                              ┌──────────────────────────────────┐
                              │ GATE 3: Triagem de Marcas d'Água │ ──► Dashboard Localhost (3336);
                              │ (Inspeção visual e crop de logos)│     ações de aprovação/corte
                              └────────────────┬─────────────────┘
                                               │
               ┌───────────────────────────────┴─────────────────────────────┐
               ▼                                                             ▼
┌──────────────────────────────┐                              ┌──────────────────────────────┐
│ GATE 4: Vínculo Determinístico│ ──► Injeta [IMAGEM 1] nas   │ GATE 5: Saneamento Alternativ.│ ──► Corrige URLs cruas;
│ (Enunciado âncora textual)   │     5.571 questões sem tag   │ & Auditoria de Gabaritos Vis.│     revalida gabaritos
└──────────────┬───────────────┘                              └──────────────┬───────────────┘
               │                                                             │
               └───────────────────────────────┬─────────────────────────────┘
                                               ▼
                              ┌──────────────────────────────────┐
                              │ GATE 6: Resgate de Faltantes     │ ──► Cadernos oficiais locais
                              │ (710 enunciados + 27 alternat.)  │     + Web Search de PDFs
                              └──────────────────────────────────┘
```

---

## 🛠️ 2. Detalhamento Operacional de Cada Gate

### 🟢 Gate 1: Conversão Universal para WebP
* **Escopo:** 1.427 ocorrências em formatos não-WebP (1.289 JPG/JPEG, 101 PNG, 36 BMP, 1 GIF).
* **Fase 1.1 (Ativação dos 1.136 arquivos locais Prova de Residência):**
  * As 1.136 imagens da Prova de Residência já estão convertidas em `data/imagens_provaderesidencia/q_{id}_1.webp`.
  * Validação física via script Node.js com biblioteca `sharp` (resolução, ausência de bytes corrompidos, conformidade MIME).
* **Fase 1.2 (Conversão das 291 Imagens Restantes):**
  * Download para diretório temporário `temp_images_legacy/` com hash SHA-256 de validação.
  * Aplicação de perfis clínicos de compressão com `sharp`:
    * *ECG, Tabelas e Traçados:* `sharp().webp({ lossless: true, effort: 6 })`.
    * *RX, TC, RM, Dermatologia:* `sharp().webp({ quality: 88, effort: 6, smartSubsample: true })`.
* **Critério de Saída (DoD):** 0 imagens ativas com extensão diferente de `.webp`.

---

### 🌐 Gate 2: Centralização de Hospedagem & Eliminação de Links Externos
* **Escopo:** Desvincular todas as 1.136 imagens em `pdres.s3.amazonaws.com`, as 390 imagens em `api.medevo.com.br`, as 90 imagens em `ezluharxlmlqhdkqrjbz...` e os 8 links externos (Wikimedia, Harvard).
* **Estrutura Canônica no Storage Oficial:**
  ```
  https://[SUPABASE_PROJECT].supabase.co/storage/v1/object/public/questoes/[banca]/[ano]/[id_questao]_[idx].webp
  ```
* **Resolução dos 23 Caminhos Relativos:**
  * Caminhos como `/images/questoes/ginecologia/...` são mapeados determininisticamente para suas pastas canônicas no storage.
* **Critério de Saída (DoD):** 100% das imagens respondendo HTTP 200 sob o domínio oficial do Supabase do Banco Residência.

---

### 👁️ Gate 3: Triagem de Marcas d'Água de Terceiros & Dashboard no Localhost
* **Escopo:** Triagem rigorosa de marcas d'água das plataformas concorrentes (Medcurso, Medgrupo, Estratégia MED, Medway, Sanar, Hardwork, Prova de Residência, MedEvo, etc.).
* **Arquitetura do Dashboard Localhost (`scripts/dashboard_imagens_server.mjs` - Porta 3336):**
  * Servidor HTTP nativo em Node.js com interface responsiva moderna e modo escuro.
  * Funcionalidades do Dashboard:
    1. **Visualizador em Alta Resolução (Zoom & Split Screen):** Inspeciona a imagem ampliada em até 200% ao lado do enunciado médico completo.
    2. **Filtros por Risco:**
       * *Filtro MedEvo (390 imagens)*
       * *Filtro Prova de Residência (1.136 imagens)*
       * *Filtro Supabase Geral (5.449 imagens)*
       * *Filtro por Bancas Mais Vulneráveis a Scrapers (USP, ENARE, AMRIGS, SUS-SP)*.
    3. **Ações Imediatas de Curadoria:**
       * `[✅ APROVADA - Sem Marca d'Água]`
       * `[✂️ CROP / RECORTAR BORDA]` (Corta rodapé/cabeçalho de scraper sem atingir o exame médico).
       * `[🔄 ENVIAR PARA GATE 6]` (Solicita extração do PDF original ou busca web).
       * `[⚠️ REPORTAR IRREGULARIDADE]`
    4. **Persistência Determinística:** Decisões gravadas em tempo real em `data/supabase_tables/image_watermark_decisions.json`.
* **Critério de Saída (DoD):** 100% das imagens auditadas e homologadas sem nenhuma logo de concorrente.

---

### 🔗 Gate 4: Vínculo Determinístico Enunciado-Imagem
* **Escopo:** 5.571 questões com imagem na coluna `images`, mas sem tag indicativa no texto do enunciado (`statement`).
* **Regras de Injeção Contextual:**
  * *Padrão 1 (Menção Direta):* Se o texto contiver frases como "Observe o traçado abaixo", "A tomografia computadorizada revelou", a tag `[IMAGEM 1]` é injetada imediatamente após o período.
  * *Padrão 2 (Múltiplas Figuras):* Se o enunciado fizer distinção entre figura 1 e 2, vincula determininisticamente `[IMAGEM 1]` e `[IMAGEM 2]`.
  * *Padrão 3 (Final do Cenário Clínico):* Injeção da tag antes do comando final da questão.
* **Critério de Saída (DoD):** Toda questão com imagem possui sua correspondente tag `[IMAGEM X]` perfeitamente contextualizada no corpo do enunciado.

---

### 🎯 Gate 5: Saneamento de Alternativas & Auditoria Rigorosa de Gabaritos Visuais
* **Escopo:** 90 questões com imagens nas assertivas e 27 questões com `(VER IMAGEM)`.
* **Problema Crítico de Gabarito:**
  * Scrapers de terceiros comumente invertem ou desordenam a sequência de imagens das opções (A, B, C, D), gerando gabaritos incorretos no banco.
* **Protocolo de Resolução:**
  1. **Higienização Estrutural:** Remover a URL crua de `opt.text` e migrá-la para `opt.images = ["https://.../opt_X.webp"]`.
  2. **Auditoria Cruzada de Gabarito:**
     * Cruzar cada questão com o gabarito oficial definitivo da banca em `data/official_exams/`.
     * Avaliação clínica do preceptor/especialista: validar se a alternativa apontada como correta corresponde tecnicamente à figura que responde ao comando da questão.
  3. **Aba de Validação no Dashboard Local:**
     * Visualização comparativa lado a lado das alternativas visuais (Grid A, B, C, D) para conferência e retificação imediata do gabarito.
* **Critério de Saída (DoD):** 100% das opções exibindo imagens em formato estruturado limpo e com gabarito médico oficial certificado.

---

### 🔎 Gate 6: Resgate de Imagens Faltantes via Cadernos Locais e Web Search
* **Escopo:** 710 questões com menções clínicas explícitas no enunciado sem imagem e 27 com alternativas `(VER IMAGEM)` vazias.
* **Estratégia de Resgate em 3 Camadas:**
  1. **Camada 1 (Repositório Local):**
     * Cruzamento por Banca + Ano + Número da Questão nos cadernos em `data/official_exams/` (USP, Einstein, Santa Casa, Unicamp, AMRIGS, ENARE, etc.).
     * Extração direta da figura do PDF e conversão para WebP.
  2. **Camada 2 (Pesquisa na Web Automatizada & Assistida):**
     * Para questões de bancas sem caderno em disco:
       * Script de busca web mirando repositórios oficiais e bancas examinadoras (FUVEST, VUNESP, AOCP, IADES, AMRIGS, CEPUERJ, etc.).
       * Download do caderno de prova em PDF, recorte da figura em alta resolução e conversão em WebP.
  3. **Camada 3 (Quarentena e Anulação Oficial):**
     * Para questões onde a imagem for comprovadamente irrecuperável:
       * Se o texto descreve o laudo completamente: ajustar redação para torná-la autossuficiente.
       * Se a questão for impossível de resolver sem a imagem: checar retificação oficial da banca para homologar anulação (`is_anulada = 1`, `correct_answer = 'ANULADA'`) ou isolar em quarentena.
* **Critério de Saída (DoD):** 0 questões ativas no banco contendo promessas de imagens inexistentes.

---

## 🔒 3. Salvaguardas & Integridade de Execução

1. **Snapshots de Checkpoint:** Antes de aplicar as alterações de cada Gate, o banco gera um checkpoint de segurança (ex: `staging_checkpoint_gate1.sqlite`).
2. **Logs Auditáveis:** Toda imagem convertida, re-hospedada ou recortada gera um registro detalhado em JSON contendo hash SHA-256 original e final.
3. **Imutabilidade das Tabelas Originais:** A tabela `questions_curated_staging` é a única atualizada; as tabelas brutas permanecem intactas como linha de base.
