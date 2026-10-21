import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const DEFAULT_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

const rawToken = process.argv.slice(2).join(' ').trim().replace(/^Bearer\s+/i, '').replace(/["']/g, '');

if (!rawToken || rawToken.length < 20) {
  console.log('Uso: node scripts/set_medbrave_token.mjs <SEU_TOKEN_JWT>');
  console.log('Exemplo: npm run token:medbrave "eyJhbGciOi..."');
  process.exit(1);
}

try {
  const parts = rawToken.split('.');
  if (parts.length !== 3) {
    console.error('❌ O token fornecido não parece ser um JWT válido.');
    process.exit(1);
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
  const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
  const isExpired = expDate ? Date.now() > expDate.getTime() : false;

  const currentConfig = fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) : {};
  currentConfig.MEDEVO_ANON_KEY = DEFAULT_APIKEY;
  currentConfig.MEDEVO_USER_TOKEN = rawToken;
  currentConfig.USER_ID = payload.sub || payload.user_id || 'active_user';
  currentConfig.updated_at = new Date().toISOString();

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2), 'utf8');

  console.log('====================================================');
  console.log('✅ TOKEN MEDBRAVE SALVO COM SUCESSO!');
  console.log('====================================================');
  console.log(`👤 Usuário: ${payload.email || payload.name || payload.sub}`);
  console.log(`📅 Expira em: ${expDate ? expDate.toLocaleString('pt-BR') : 'Indeterminado'}`);
  if (isExpired) {
    console.warn('⚠️ ALERTA: Este token já está expirado!');
  } else {
    console.log('🟢 Status: ATIVO E PRONTO PARA USO');
    console.log('👉 Execute agora: npm run extract:medbrave');
  }
} catch (e) {
  console.error('❌ Erro ao salvar token:', e.message);
  process.exit(1);
}
