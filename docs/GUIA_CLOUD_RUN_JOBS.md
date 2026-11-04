# Guia de Execução em Nuvem: Google Cloud Run Jobs

Este guia detalha como executar a geração em lote dos comentários padrão-ouro das questões homologadas diretamente no **Google Cloud Run Jobs**, utilizando **100% das suas chaves gratuitas** e com **custo financeiro R$ 0,00** (sem usar chaves pagas).

---

## ⚡ Como Funciona a Arquitetura em Nuvem

1. **Docker Container Leve (`Dockerfile.job`):**
   * Base `node:22-alpine` enxuta.
   * Contém apenas o motor de resolução e o catálogo médico (`medicalKnowledgeCatalog.json`).
2. **Motor Cloud Native (`scripts/cloud_batch_solve.mjs`):**
   * Busca as questões pendentes diretamente do **Supabase** via REST API.
   * Alterna dinamicamente entre todas as chaves gratuitas no pool (`GEMINI_API_KEY_1`, `_2`, etc.) e entre modelos Flash (`gemini-3.5-flash-lite`, `gemini-flash-lite-latest`, etc.).
   * Atualiza as questões comentadas no Supabase a cada 15 resoluções.
   * Desliga automaticamente quando as cotas diárias gratuitas são atingidas.
3. **Blindagem de Custos:**
   * O gerador `scripts/prepare_cloud_run_env.mjs` filtra estritamente as chaves pagas (`GEMINI_API_KEY_PAID` e `GEMINI_API_KEY_ON_DEMAND`).
   * O container na nuvem recebe apenas o arquivo `.env.cloud` com as chaves gratuitas.

---

## 🚀 Como Fazer o Deploy (Passo a Passo)

### Opção A: Pelo Terminal / Google Cloud SDK

Se você possui o `gcloud` instalado e autenticado na sua conta:

```bash
# Windows PowerShell
./deploy_job.ps1

# Linux / Mac / Google Cloud Shell
chmod +x deploy_job.sh
./deploy_job.sh
```

### Opção B: Pelo Google Cloud Shell (Direto no Navegador — Sem Instalar Nada)

1. Abra o [Google Cloud Console](https://console.cloud.google.com/) e clique no ícone do **Cloud Shell** (terminal no canto superior direito).
2. Clone o repositório ou suba a pasta do projeto:
   ```bash
   git clone https://github.com/bancoresidencia/bancoresidencia.git
   cd bancoresidencia
   ```
3. Crie o arquivo `.env.cloud` com as suas chaves ou use o gerador:
   ```bash
   node scripts/prepare_cloud_run_env.mjs
   ```
4. Execute o deploy:
   ```bash
   chmod +x deploy_job.sh
   ./deploy_job.sh
   ```

---

## 🎮 Comandos Úteis

### 1. Disparar Execução Manual do Job
```bash
gcloud run jobs execute solve-questions-job --region us-central1
```

### 2. Acompanhar os Logs em Tempo Real
```bash
gcloud beta run jobs logs tail solve-questions-job --region us-central1
```

### 3. Alterar Especialidade Alvo ou Concorrência
Para rodar outra especialidade (ex: Clínica Médica):
```bash
gcloud run jobs execute solve-questions-job \
  --region us-central1 \
  --update-env-vars TARGET_SPECIALTY=clinica,CONCURRENCY=6
```

### 4. Automatizar Execução Diária (Cloud Scheduler)
Para disparar automaticamente todos os dias às **21h15 BRT** (quando as cotas gratuitas resetam):
```bash
gcloud scheduler jobs create http trigger-solve-questions-daily \
  --location us-central1 \
  --schedule "15 21 * * *" \
  --time-zone "America/Sao_Paulo" \
  --uri "https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/SEU_PROJECT_ID/jobs/solve-questions-job:run" \
  --http-method POST \
  --oauth-service-account-email SEU_EMAIL_DE_SERVICO@SEU_PROJECT_ID.iam.gserviceaccount.com
```
