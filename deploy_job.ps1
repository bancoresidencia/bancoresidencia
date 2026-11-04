Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY DO MOTOR DE GABARITOS NO GOOGLE CLOUD RUN JOBS" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Gera arquivo de variáveis seguras (.env.cloud) sem chave paga
node scripts/prepare_cloud_run_env.mjs

$region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$jobName = if ($env:JOB_NAME) { $env:JOB_NAME } else { "solve-questions-job" }

Write-Host "`n📦 Construindo imagem e implantando Cloud Run Job [$jobName] na região [$region]..." -ForegroundColor Yellow

gcloud run jobs deploy $jobName `
  --source . `
  --dockerfile Dockerfile.job `
  --region $region `
  --tasks 1 `
  --max-retries 1 `
  --task-timeout 86400s `
  --cpu 1 `
  --memory 1Gi `
  --env-vars-file .env.cloud

Write-Host "`n✅ Job implantado com sucesso!" -ForegroundColor Green
Write-Host "👉 Para executar manualmente agora:" -ForegroundColor White
Write-Host "   gcloud run jobs execute $jobName --region $region" -ForegroundColor Gray
