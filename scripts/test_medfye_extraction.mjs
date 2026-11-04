import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medfye_config.json');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error('❌ scripts/medfye_config.json não encontrado!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

async function main() {
  console.log('===============================================================');
  console.log('🔍 DIAGNÓSTICO DE EXTRAÇÃO BACKEND MEDFYE');
  console.log('===============================================================\n');

  console.log(`👤 Usuário logado: ${config.email} (${config.userId})`);
  console.log(`🌐 Base Worker: ${config.baseUrl}`);
  console.log(`⚡ Supabase: ${config.supabaseUrl}`);
  console.log(`🔑 Token ativo: ${config.token.slice(0, 35)}...\n`);

  // 1. Catálogo
  console.log('1️⃣ Testando endpoint do Catálogo (/v1/catalogo?formato=2)...');
  const catRes = await fetch(`${config.baseUrl}/v1/catalogo?formato=2`, {
    headers: { 'authorization': `Bearer ${config.token}` }
  });
  console.log(`   Status HTTP: ${catRes.status} (${catRes.statusText})`);
  const catText = await catRes.text();
  console.log(`   Resposta: ${catText.slice(0, 150)}`);

  // 2. Assinatura no Supabase
  console.log('\n2️⃣ Verificando perfil e assinatura no Supabase RPC (assinatura_mr)...');
  const subRes = await fetch(`${config.supabaseUrl}/rest/v1/rpc/assinatura_mr`, {
    method: 'POST',
    headers: {
      'apikey': config.publishableKey,
      'authorization': `Bearer ${config.token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({})
  });
  const subData = await subRes.json().catch(() => null);
  console.log(`   Status RPC: ${subRes.status}`);
  console.log(`   Dados da Conta:`, subData);

  console.log('\n===============================================================');
  if (catRes.status === 200) {
    console.log('🎉 SUCESSO: CONTA COM ACESSO LIBERADO PARA EXTRAÇÃO IMEDIATA!');
  } else if (catRes.status === 403) {
    console.log('⚠️ CONTA IDENTIFICADA COMO "VISITANTE" (SEM ASSINATURA ATIVA).');
    console.log('👉 Para liberar o download das 126.000 questões com gabarito:');
    console.log('   - É necessário que a conta tenha assinatura ativa OU 1 dia grátis via link de convite (?convite=token).');
  }
  console.log('===============================================================');
}

main().catch(console.error);
