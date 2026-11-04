import fs from 'fs';
import path from 'path';

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// Conjunto de chaves pagas que JAMAIS serão exportadas
const paidValues = new Set([
  env.GEMINI_API_KEY_PAID,
  env.GEMINI_API_KEY_ON_DEMAND
].filter(Boolean));

const safeEnvVars = {};

// 1. Chaves Gemini Gratuitas
Object.keys(env)
  .filter(k => {
    if (!k.startsWith('GEMINI_API_KEY')) return false;
    if (k.includes('PAID') || k.includes('DEMAND') || k.includes('BILLING')) return false;
    const val = env[k];
    if (!val || paidValues.has(val)) return false;
    return true;
  })
  .forEach(k => {
    safeEnvVars[k] = env[k];
  });

// 2. Supabase
if (env.NEXT_PUBLIC_SUPABASE_URL) {
  safeEnvVars['NEXT_PUBLIC_SUPABASE_URL'] = env.NEXT_PUBLIC_SUPABASE_URL;
}
if (env.SUPABASE_SERVICE_ROLE_KEY) {
  safeEnvVars['SUPABASE_SERVICE_ROLE_KEY'] = env.SUPABASE_SERVICE_ROLE_KEY;
}

// 3. Configurações padrão do Job
safeEnvVars['NODE_ENV'] = 'production';
safeEnvVars['TARGET_SPECIALTY'] = 'cirurgia';
safeEnvVars['CONCURRENCY'] = '6';

// Escreve arquivo de variáveis seguras para o Cloud Run (.env.cloud)
const envFileLines = Object.entries(safeEnvVars).map(([k, v]) => `${k}=${v}`);
fs.writeFileSync('.env.cloud', envFileLines.join('\n') + '\n', 'utf8');

console.log('======================================================');
console.log('🔒 GERADOR DE AMBIENTE CLOUD RUN (100% FREE TIER)');
console.log('======================================================');
console.log(`✅ Chaves gratuitas incluídas: ${Object.keys(safeEnvVars).filter(k => k.startsWith('GEMINI')).length}`);
console.log('🛑 Chaves pagas (PAID/DEMAND): BLOQUEADAS E EXCLUÍDAS');
console.log('📁 Arquivo gerado: .env.cloud (utilizado para deploy no GCP)\n');

// Monta lista formatada de flags para o comando gcloud
const envFlagString = Object.entries(safeEnvVars)
  .map(([k, v]) => `${k}=${v}`)
  .join(',');

console.log('--- COMANDO DE DEPLOY NO GOOGLE CLOUD RUN JOBS ---');
console.log(`
gcloud run jobs deploy solve-questions-job \\
  --source . \\
  --dockerfile Dockerfile.job \\
  --region us-central1 \\
  --tasks 1 \\
  --max-retries 1 \\
  --task-timeout 86400s \\
  --cpu 1 \\
  --memory 1Gi \\
  --env-vars-file .env.cloud
`);

console.log('--- COMANDO PARA DISPARAR A EXECUÇÃO MANUAL ---');
console.log('gcloud run jobs execute solve-questions-job --region us-central1\n');

console.log('--- COMANDO PARA AGENDAR DIARIAMENTE ÀS 21:15 (CLOUD SCHEDULER) ---');
console.log(`
gcloud scheduler jobs create http trigger-solve-questions-daily \\
  --location us-central1 \\
  --schedule "15 21 * * *" \\
  --time-zone "America/Sao_Paulo" \\
  --uri "https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/solve-questions-job:run" \\
  --http-method POST \\
  --oauth-service-account-email YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com
`);
