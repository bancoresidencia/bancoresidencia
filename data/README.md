# 📚 Catálogo & Estrutura do Diretório de Dados (`data/`)

> **Projeto:** Banco Residência  
> **Volume Total:** ~18 GB de dados (Bases SQLite, Datasets JSON, Coletas Brutas e Backups)  
> **Finalidade deste documento:** Explicar detalhadamente o papel de cada pasta e arquivo em `data/`, suas datas de criação/modificação, e como organizá-los para trabalho local e compartilhamento seguro no Google Drive.

---

## 🏗️ 1. Visão Geral da Arquitetura de Dados

Os arquivos em `data/` estão divididos em 6 grandes grupos operacionais:

```
data/
├── 🌟 1. DATASETS FINAIS DE PRODUÇÃO (Bases Consolidadas em JSON)
├── 🗄️ 2. BANCOS DE DADOS LOCAIS (SQLite / Pipelines de Ingestão)
├── 📄 3. PROVAS OFICIAIS E DOCUMENTOS PDF
├── 🌐 4. SCRAPES BRUTOS E ETAPAS DE COLETA (Staging)
├── 🔍 5. AUDITORIAS, LOGS E CONGRUÊNCIA DE GABARITOS
└── 📦 6. BACKUPS HISTÓRICOS DE SEGURANÇA
```

---

## 🌟 2. Datasets Finais de Produção (Bases Consolidadas)
Estes são os arquivos JSON que contêm as questões prontas, curadas com enunciados, alternativas, gabaritos e explicações médicas por grande área:

| Arquivo | Tamanho | Última Modificação | O que é / Descrição |
| :--- | :---: | :---: | :--- |
| `clinica_medica_final_questions.json` | 150 MB | 08/11/2026 | Questões consolidadas de Clínica Médica (padrão ouro). |
| `pediatria_final_questions.json` | 114 MB | 06/11/2026 | Questões consolidadas de Pediatria. |
| `obstetricia_final_questions.json` | 71 MB | 07/11/2026 | Questões consolidadas de Obstetrícia. |
| `ginecologia_final_questions.json` | 72 MB | 08/11/2026 | Questões consolidadas de Ginecologia. |
| `cirurgia_final_questions.json` | 50 MB | 06/11/2026 | Questões consolidadas de Cirurgia Geral. |
| `medicina_preventiva_final_questions.json` | 41 MB | 06/11/2026 | Questões consolidadas de Medicina Preventiva e Social. |
| `nefrologia_final_questions.json` | 13 MB | 06/11/2026 | Subfoco especializado de Nefrologia. |
| `urologia_final_questions.json` | 5 MB | 06/11/2026 | Subfoco especializado de Urologia. |
| `all_homologated_questions_gold.json` | 25 MB | 04/11/2026 | Compilado "Gold" com questões validadas e homologadas. |
| `questoes_ineditas_livros_drive_7822.json` | 17 MB | 09/10/2026 | Questões inéditas curadas a partir de referências médicas. |

---

## 🗄️ 3. Bancos de Dados Locais SQLite (~5,5 GB)
Bases relacionais locais usadas para compilar, desduplicar e normalizar questões antes de subir para o Supabase:

| Arquivo / Pasta | Tamanho | Data | O que é / Descrição |
| :--- | :---: | :---: | :--- |
| `staging_expansion_unified.db` | **3,79 GB** | 07/11/2026 | Banco unificado de expansão de questões e alternativas. |
| `bancos_organizados_staging/residencia_acesso_direto.db` | **1,00 GB** | 07/11/2026 | Base de provas de acesso direto catalogadas por ano e banca. |
| `provaderesidencia_coleta.db` | **176 MB** | 21/10/2026 | Base local de raspagem/coleta da plataforma Prova de Residência. |
| `questmed_extracted_exams.db` | **171 MB** | 20/10/2026 | Base de exames extraídos da plataforma QuestMed. |
| `gabaritos_nacional.db` | 184 KB | 13/10/2026 | Tabela relacional de cruzamento de gabaritos oficiais. |

---

## 📄 4. Provas Oficiais e Documentos PDF (~1,1 GB)
Acervo de provas e cadernos de questões originais em PDF e compactados:

| Pasta | Tamanho | Período | O que é / Descrição |
| :--- | :---: | :---: | :--- |
| `official_exams/` | **506 MB** | Outubro 2026 | Provas oficiais em PDF e ZIP (IAMSPE, Santa Casa SP, SUS-SP, etc.). |
| `inep_pdfs/` | **72 MB** | 08/10/2026 | Provas oficiais do Revalida INEP (2020 a 2024). |
| `enare_pdfs/` / `enare_raw/` / `enare_test/` | ~13 MB | Outubro 2026 | Cadernos de prova e arquivos de validação do ENARE. |

---

## 🌐 5. Scrapes Brutos e Ingestão (`staging/`, `scraped_exams/`, etc.)
Arquivos intermediários gerados por bots e crawlers durante a raspagem de bancos externos:

| Pasta / Arquivo | Tamanho | Data | O que é / Descrição |
| :--- | :---: | :---: | :--- |
| `scraped_exams/` | **1,04 GB** | 03/11/2026 | JSONs individuais de provas baixadas via scripts automáticos. |
| `staging/` | **424 MB** | 06/11/2026 | Lotes em preparação (como `expansao_ineditas_consolidadas.jsonl`). |
| `hardwork/` / `audit_hardwork/` | **302 MB** | 04/11/2026 | Extração de questões e imagens da plataforma Hardwork Medicina. |
| `checkpoints/` | **281 MB** | 05/11/2026 | Checkpoints de resolução por IA e pipelines interrompidos. |
| `knowledge/` | **201 MB** | 26/10/2026 | Base de conhecimento e materiais textuais de apoio médico. |
| `medbrave_questions_clean.json` | 112 MB | 20/10/2026 | Extração bruta limpa de questões MedBrave. |
| `*_medevo_extracted.json` | ~250 MB | 05-07/10/2026 | Extrações iniciais por especialidade da plataforma MedEvo. |

---

## 📦 6. Backups Históricos de Segurança (~8,8 GB)
Cópias de segurança tiradas antes de grandes refatorações, cruzamento de gabaritos e retificações:

| Pasta | Tamanho | Data | Descrição do Backup |
| :--- | :---: | :---: | :--- |
| `backups/` | **6,83 GB** | 06/11/2026 | Backups das fases 1, 2 e 3 e mesclagem de 259k questões. |
| `backups_pre_correcao/` | **553 MB** | 22/10/2026 | Backups tirados antes da rodada de correção de gabaritos. |
| `backups_pre_cruzamento/` | **439 MB** | 03/11/2026 | Estado antes do cruzamento de assertivas duplicadas. |
| `backups_pre_retificacao_20261101/` | **432 MB** | 01/11/2026 | Snapshot antes da aplicação das retificações de 01/11. |
| `backups_pre_correcao_gabaritos_2026/` | **341 MB** | 26/10/2026 | Snapshot anterior à auditoria de gabaritos discordantes. |
| `backups_pre_drive/` | **250 MB** | 16/10/2026 | Backup prévio à integração do drive de questões. |
| `*.bak` e `*.bak_*` | Centenas MB | Várias | Arquivos `.bak` individuais gerados por scripts Python/Node. |

---

## 🔍 7. Auditorias, Relatórios e Metadados
Arquivos de log e relatórios de discrepâncias de gabarito e integridade:
- `relatorio_auditoria_profunda_completa.json` (3,2 MB - 01/11/2026): Varredura completa de incongruências.
- `pending_supabase_gabarito_sync.json` (2,6 MB - 06/11/2026): Fila de gabaritos corrigidos a sincronizar com o Supabase.
- `congruence_sync_patches.json` (1,2 MB - 06/11/2026): Patches aplicados para alinhar local e nuvem.
- `hierarquia_completa_filtros.json` (1,0 MB - 01/11/2026): Árvore canônica de especialidades, temas e focos.

---

## ☁️ 8. Como Subir e Sincronizar com o Google Drive

Para você e seu colega trabalharem sem sobrecarregar o GitHub:

1. **Crie no Google Drive a pasta:**  
   `BancoResidencia-Data/`
2. **Suba para o Drive:**
   - As bases SQLite (`staging_expansion_unified.db`, `residencia_acesso_direto.db`, etc.).
   - Os JSONs de produção (`clinica_medica_final_questions.json`, etc.).
   - As pastas `official_exams/`, `staging/`, `scraped_exams/` e `knowledge/`.
   - Se quiser guardar os backups históricos, compacte as pastas de `backups/` em um único arquivo `.zip` e suba lá.
3. **No seu código (`src/`):**
   - Nada precisa mudar! O site continua consumindo os dados diretamente da API do **Supabase**.
   - Os scripts que precisarem rodar offline leem da pasta `data/` local sem que esses 18 GB precisem sujar o Git.

