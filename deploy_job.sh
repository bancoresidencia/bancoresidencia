#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🚀 DEPLOY DO MOTOR DE GABARITOS NO GOOGLE CLOUD RUN JOBS"
echo "=========================================================="

# 1. Gera arquivo de variáveis seguras (.env.cloud) sem chave paga
node scripts/prepare_cloud_run_env.mjs

REGION=${GCP_REGION:-"us-central1"}
JOB_NAME=${JOB_NAME:-"solve-questions-job"}

echo ""
echo "📦 Construindo imagem e implantando Cloud Run Job [$JOB_NAME] na região [$REGION]..."

gcloud run jobs deploy "$JOB_NAME" \
  --source . \
  --dockerfile Dockerfile.job \
  --region "$REGION" \
  --tasks 1 \
  --max-retries 1 \
  --task-timeout 86400s \
  --cpu 1 \
  --memory 1Gi \
  --env-vars-file .env.cloud

echo ""
echo "✅ Job implantado com sucesso!"
echo "👉 Para executar manualmente agora:"
echo "   gcloud run jobs execute $JOB_NAME --region $REGION"
