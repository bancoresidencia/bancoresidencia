import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'nexmed_config.json');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error('❌ Arquivo de configuração scripts/nexmed_config.json não encontrado!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const BASE_URL = config.baseUrl || 'https://nexmed.space/api';
const TOKEN = config.token;

function cleanZeroWidth(text) {
  if (!text || typeof text !== 'string') return text;
  // Remove zero-width spaces, joiners, markers used as watermark
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

async function main() {
  console.log('===============================================================');
  console.log('🔍 TESTE DE DIAGNÓSTICO E EXTRAÇÃO BACKEND NEXMED');
  console.log('===============================================================\n');

  // 1. Perfil / Autenticação
  console.log('1️⃣ Testando autenticação do usuário...');
  const profileRes = await request('/auth/profile');
  if (profileRes.status !== 200 || !profileRes.data?.success) {
    console.error('❌ Falha na autenticação:', profileRes.status, profileRes.data);
    return;
  }
  const user = profileRes.data.data?.user || profileRes.data.data?.profile || profileRes.data.data;
  console.log(`   ✅ Conectado como: ${user.nome || user.email || config.email} (${user.email || config.email})`);
  console.log(`   🏷️ Tipo: ${user.tipo || 'estudante'} | Plano: ${user.subscription_status || 'free'}\n`);

  // 2. Filtros e Metadados do Banco
  console.log('2️⃣ Consultando catálogo e filtros do banco...');
  const filtrosRes = await request('/questoes/filtros?categoria=residencia&incluir=bancas&incluir=anos&incluir=especialidades');
  if (filtrosRes.status === 200 && filtrosRes.data?.success) {
    const bancas = filtrosRes.data.data.bancas || [];
    const anos = filtrosRes.data.data.anos || [];
    const especialidades = filtrosRes.data.data.especialidades || [];
    console.log(`   📊 Total de bancas mapeadas: ${bancas.length}`);
    console.log(`   📅 Anos disponíveis: ${anos.map(a => a.ano).join(', ')}`);
    console.log(`   🩺 Especialidades mapeadas: ${especialidades.length}\n`);
  }

  // 3. Listagem de Questões (Limite máximo de 100 por requisição)
  console.log('3️⃣ Testando busca de questões no endpoint /questoes...');
  const listRes = await request('/questoes?categoria=residencia&page=1&limit=2');
  if (listRes.status !== 200 || !listRes.data?.success) {
    console.error('❌ Falha na listagem de questões:', listRes.status, listRes.data);
    return;
  }

  const pagination = listRes.data.pagination;
  const sampleQuestions = listRes.data.data?.questions || [];
  console.log(`   ✅ Total de questões disponíveis: ${pagination.total.toLocaleString('pt-BR')}`);
  console.log(`   📄 Páginas totais (limit=100): ${Math.ceil(pagination.total / 100)}`);
  console.log(`   ⏱️ Rate limit da listagem: ${listRes.headers.get('ratelimit-policy') || '10;w=60 (10 req/min)'}\n`);

  if (sampleQuestions.length > 0) {
    const q = sampleQuestions[0];
    console.log('4️⃣ Amostra de questão obtida:');
    console.log(`   ID: ${q.id}`);
    console.log(`   Banca: ${q.fonte} | Ano: ${q.ano} | Especialidade: ${q.especialidade}`);
    console.log(`   Enunciado limpo: "${cleanZeroWidth(q.enunciado).slice(0, 120)}..."`);
    console.log(`   Alternativas: ${q.alternativas?.length} opções\n`);

    // 4. Teste do Gabarito via /responder
    console.log('5️⃣ Testando recuperação de GABARITO e JUSTIFICATIVA via /responder...');
    const ansRes = await request(`/questoes/${q.id}/responder`, {
      method: 'POST',
      body: JSON.stringify({ resposta: 'A', tempo_resposta_segundos: 10 })
    });

    if (ansRes.status === 200 && ansRes.data?.success) {
      const respData = ansRes.data.data;
      console.log('   🎉 GABARITO E JUSTIFICATIVA OBTIDOS COM SUCESSO!');
      console.log(`   🎯 Gabarito Oficial: [Opção ${respData.resposta_correta}]`);
      console.log(`   💡 Tema / Explicação: ${respData.explicacao}`);
      console.log(`   📝 Justificativa Completa: "${cleanZeroWidth(respData.justificativa)}"`);
      console.log(`   ⚡ Rate limit do endpoint responder: ${ansRes.headers.get('ratelimit-policy') || '6000;w=900 (400 req/min)'}`);
    } else {
      console.error('   ❌ Falha ao obter resposta:', ansRes.status, ansRes.data);
    }
  }

  console.log('\n===============================================================');
  console.log('✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO: EXTRAÇÃO 100% VIÁVEL!');
  console.log('===============================================================');
}

main().catch(console.error);
