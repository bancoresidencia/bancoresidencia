# 🚀 Guia de Operação e Execução Paralela — Fase 2 (Motor Distribuído no Supabase)

Este documento define a arquitetura, as regras de negócio e o passo a passo operacional para que **dois desenvolvedores (Dev 1 e Dev 2)** executem a recuperação e homologação de gabaritos em paralelo em seus respectivos computadores, com **zero sobreposição** e **acompanhamento em tempo real**.

---

## 📌 1. Universo de Provas Garantido (2020 a 2026 com $\ge 20$ Faltantes)

O motor central cobre **100% das provas do banco** entre 2020 e 2026 com déficit igual ou superior a 20 questões:

| Indicador | Total Mapeado | Detalhes |
| :--- | :--- | :--- |
| **Total de Provas** | **530 provas** | Todas com identificador único (`TASK-ANO-BANCA-ORDEM`) |
| **Total de Questões no Universo** | **41.062 questões** | Questões cadastradas nas 530 provas |
| **Total de Gabaritos a Homologar** | **29.855 gabaritos** | Meta de recuperação da Fase 2 |

### Distribuição por Ano e Prioridade

```
  • Ano 2020: 85 provas
  • Ano 2021: 95 provas
  • Ano 2022: 79 provas
  • Ano 2023: 78 provas
  • Ano 2024: 62 provas
  • Ano 2025: 65 provas
  • Ano 2026: 66 provas
```

- **P1 (Alta Prioridade — 124 provas):** Grandes bancas estaduais e nacionais (ENARE, UNICAMP, USP, SES-GO, SES-PE, SES-DF, PSU-MG, AMRIGS, SUS-SP, SUS-BA, UERJ, ABEM, AMP).
- **P2 (Média Prioridade — 219 provas):** Provas recentes de 2024 a 2026 com mais de 50 questões pendentes.
- **P3 (Normal — 187 provas):** Demais provas municipais, hospitais privados e faculdades isoladas.

---

## ⚙️ 2. Arquitetura do Motor no Supabase (Zero Colisão)

O plano motor reside diretamente no **Supabase Storage** (bucket `questoes`), acessível em nuvem por ambas as máquinas:

```
                       ┌──────────────────────────────────────────────┐
                       │          SUPABASE CENTRAL (Nuvem)            │
                       │   bucket: 'questoes' (Estado em Tempo Real)  │
                       │                                              │
                       │   • fase2_motor_manifest.json (530 Provas)   │
                       │   • fase2_motor_queue.json    (Fila Dinâmica)│
                       │   • fase2_worker_DEV_1.json   (Heartbeat D1) │
                       │   • fase2_worker_DEV_2.json   (Heartbeat D2) │
                       │   • fase2_motor_status.json   (Dashboard)    │
                       └──────────────────────┬───────────────────────┘
                                              │
                     Distributed Lease Lock   │   Distributed Lease Lock
                     Reivindicação Atômica    │   Reivindicação Atômica
                     (Zero Sobreposição)      │   (Zero Sobreposição)
                                              │
                 ┌────────────────────────────┴───────────────────────────┐
                 │                                                        │
                 ▼                                                        ▼
   ┌───────────────────────────┐                            ┌───────────────────────────┐
   │    COMPUTADOR DO DEV 1    │                            │    COMPUTADOR DO DEV 2    │
   │  (Máquina Principal)      │                            │    (Colega em Paralelo)   │
   │                           │                            │                           │
   │   npm run fase2:dev1      │                            │   npm run fase2:dev2      │
   │                           │                            │                           │
   │  1. Pede próxima tarefa   │                            │  1. Pede próxima tarefa   │
   │  2. Trava lease no Supa   │                            │  2. Trava lease no Supa   │
   │  3. Executa resolução:    │                            │  3. Executa resolução:    │
   │     - SQLite local        │                            │     - SQLite local        │
   │     - Cadernos Oficiais   │                            │     - Cadernos Oficiais   │
   │  4. Grava no Supabase     │                            │  4. Grava no Supabase     │
   │     e no JSON Gold        │                            │     e no JSON Gold        │
   │  5. Marca CONCLUIDO       │                            │  5. Marca CONCLUIDO       │
   │  6. Puxa próxima tarefa   │                            │  6. Puxa próxima tarefa   │
   └───────────────────────────┘                            └───────────────────────────┘
```

### Como a Trava Anti-Colisão (Distributed Lease Lock) Funciona:
1. Quando o `worker_fase2.mjs` liga, ele consulta a fila fresca em nuvem no Supabase.
2. Ele encontra a primeira tarefa com `status: 'PENDENTE'`.
3. Ele escreve imediatamente no Supabase: `status: 'EM_ANDAMENTO'`, `assigned_to: 'DEV_X'`, `heartbeat_at: now()`.
4. Ele faz uma segunda checagem de confirmação. Se os dois desenvolvedores pediram no mesmo milissegundo, quem teve o lock confirmado assume a tarefa e o outro pula para a seguinte.
5. Enquanto processa, o worker emite um **Heartbeat a cada 30 segundos**.
6. Se o computador de um dev for desligado ou a internet cair, após 20 minutos sem heartbeat a tarefa é automaticamente liberada de volta para a fila.

---

## 👨‍💻 3. Instruções para o Dev 1 (Você / Máquina Principal)

### Passo 1: Verificar se a fila já está inicializada
Se precisar reinicializar a fila do zero:
```bash
npm run fase2:init
```

### Passo 2: Iniciar o Worker 1
```bash
npm run fase2:dev1
```
*O worker rodará continuamente, pegando prova por prova, homologando gabaritos e sincronizando no Supabase.*

### Passo 3: Abrir o Painel de Acompanhamento (em outro terminal)
```bash
npm run fase2:watch
```

---

## 🤝 4. Instruções para o Dev 2 (Seu Colega / Máquina Paralela)

Envie estas instruções diretamente para o seu colega para que ele inicie no computador dele:

### Passo 1: Clonar o Repositório e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO_GIT> bancoresidencia
cd bancoresidencia
npm install
```

### Passo 2: Configurar o Arquivo `.env.local`
Crie o arquivo `.env.local` na raiz do projeto com as chaves do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ezluharxlmlqhdkqrjbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDkxNzcsImV4cCI6MjEwNjgyNTE3N30.kT9521OP3j5yTmnQTqF6Wzl29xc6ZjV2UzF8EB_5xrI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTI0OTE3NywiZXhwIjoyMTA2ODI1MTc3fQ.4HC3igdIbIuObD8jhQnIBMA5PoN9ShjeBcK37o9kYvA
```

### Passo 3: Iniciar o Worker 2
No terminal dele, basta rodar:
```bash
npm run fase2:dev2
```
*Pronto! O motor começará automaticamente a consumir as tarefas pendentes da fila, sem interferir nas tarefas que o Dev 1 estiver processando.*

### Passo 4: Acompanhar o Painel em Tempo Real
Em outro terminal (ou na mesma máquina):
```bash
npm run fase2:watch
```

---

## 📊 5. Comandos Úteis de Operação

| Ação | Comando | Descrição |
| :--- | :--- | :--- |
| **Iniciar Worker Dev 1** | `npm run fase2:dev1` | Executa o motor contínuo identificado como DEV 1 |
| **Iniciar Worker Dev 2** | `npm run fase2:dev2` | Executa o motor contínuo identificado como DEV 2 |
| **Testar 1 Prova Única** | `node scripts/worker_fase2.mjs --worker=DEV_1 --single` | Roda apenas 1 tarefa e finaliza |
| **Processar Tarefa Específica**| `node scripts/worker_fase2.mjs --task=TASK-2026-UNICAMP-003` | Força a execução de uma prova específica |
| **Ver Painel Estático** | `npm run fase2:status` | Exibe o resumo atualizado da fila |
| **Ver Painel ao Vivo (5s)** | `npm run fase2:watch` | Atualiza dinamicamente a cada 5 segundos no terminal |
| **Sincronizar Git Seguro**| `npm run pull` | Puxa alterações remotas com auto-stash |
| **Submeter Git Seguro** | `npm run submit` | Envia alterações validadas sem quebrar o banco |

---

## 🌐 6. Estratégia de Busca e Extração Ativa na Internet (Zero Arquivo Manual)

Nenhum desenvolvedor precisa buscar ou colar arquivos PDF manualmente. O motor foi desenhado para **buscar e extrair ativamente na internet**:

1. **Camada 1 (Bases Pré-coletadas em SQLite):** O worker consulta instantaneamente as bases `provaderesidencia_coleta.db` (86.612 questões) e `questmed_extracted_exams.db` (45.464 questões).
2. **Camada 2 (Extração Web ao Vivo na PDR):** Para as 376 provas mapeadas com ID no portal, o worker dispara automaticamente o extrator web `scripts/scrape_single_pdr_exam.py`, baixando os enunciados e gabaritos oficiais diretamente da internet para o banco SQLite local.
3. **Camada 3 (Extração em Portais de Bancas):** Provas de bancas oficiais (ENARE, UNICAMP, SES-GO, USP, UERJ, AMP-PR, SES-PE) são pesquisadas através dos crawlers de portais oficiais.
4. **Resolução Contínua Sem Bloqueio:**
   - Se os gabaritos forem recuperados online, a prova é marcada como `CONCLUIDO` e os gabaritos são sincronizados no Supabase.
   - Se a varredura web não encontrar novos gabaritos disponíveis nesta rodada, a prova é marcada como `BUSCA_WEB_CONCLUIDA`, registrando o log da tentativa e passando imediatamente para a próxima prova da fila.
   - **Zero dependência de arquivos locais manuais e zero risco de travamento do fluxo.**

---

## 🛡️ 7. Segurança de Dados e Rastreabilidade

- **Carimbo de Auditoria:** Toda questão homologada recebe a tag com rastreabilidade:
  `[Gabarito Oficial Homologado - Fase 2 (DEV_X)] Banca: NOME_BANCA (ANO)`
- **Sincronização Bidirecional:** A questão é salva tanto nos arquivos locais (`src/data/*_final_questions.json`) quanto na tabela `questions` do Supabase via REST PATCH.
- **Zero Risco de Overlap:** Dois desenvolvedores podem rodar por dias ininterruptos; a trava no Supabase garante que cada tarefa é exclusiva de quem a reivindicou.
