import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_DIR = process.cwd();

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('🚀 [ENARE Ginecologia Sync] Iniciando preparação e envio das 61 questões...\n');

  // 1. Carregar ginecologia_final_questions.json
  const finalQuestionsPath = path.join(BASE_DIR, 'data', 'ginecologia_final_questions.json');
  if (!fs.existsSync(finalQuestionsPath)) {
    console.error('❌ Arquivo data/ginecologia_final_questions.json não encontrado.');
    process.exit(1);
  }

  const allGineco = JSON.parse(fs.readFileSync(finalQuestionsPath, 'utf8'));
  console.log(`📦 Total no catálogo de Ginecologia: ${allGineco.length} questões.`);

  // 2. Filtrar especificamente as questões do ENARE
  const enareGineco = allGineco.filter(q => {
    const code = q.code || '';
    const inst = q.institution || '';
    const commentary = q.commentary || '';
    const auditSource = q.official_audit?.source || '';
    const examId = q.official_audit?.exam_id || '';

    return (
      code.startsWith('ENAREENAMED-') && code.includes('-GIN-') ||
      inst.includes('ENARE') ||
      commentary.includes('ENARE Questão') ||
      auditSource.includes('ENARE') ||
      examId.startsWith('ENARE')
    );
  });

  console.log(`🎯 Encontradas ${enareGineco.length} questões de Ginecologia do ENARE.`);

  // 3. Carregar gabaritos auditados de checkpoints para garantir gabaritos oficiais
  const goldPath = path.join(BASE_DIR, 'data', 'checkpoints', 'ginecologia_gold_anchors_complete.json');
  const goldMap = new Map();
  if (fs.existsSync(goldPath)) {
    const goldList = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
    goldList.forEach(g => {
      if (g.id) goldMap.set(g.id, g);
      if (g.code) goldMap.set(g.code, g);
    });
    console.log(`📚 Mapa Gold carregado com ${goldMap.size} referências.`);
  }

  // 4. Normalizar campos garantindo hierarquia clínica correta e taxonomia ENARE
  const payloadToUpsert = enareGineco.map((q, idx) => {
    const gold = goldMap.get(q.id) || goldMap.get(q.code);
    const ans = (q.correct_answer || q.correctAnswer || gold?.official_answer || '').trim();

    return {
      id: q.id,
      code: q.code || `ENAREENAMED-${q.year || 2024}-GIN-${String(idx + 1).padStart(4, '0')}`,
      institution: 'ENARE/ENAMED',
      banca: 'ENARE/ENAMED',
      year: parseInt(q.year, 10) || 2024,
      tipo_prova: q.tipo_prova || q.tipoProva || 'Acesso Direto',
      modalidade: 'Residência Médica',
      especialidade: 'Ginecologia',
      tema: q.tema || 'Ginecologia Geral',
      foco: q.foco || '',
      subfoco: q.subfoco || '',
      difficulty: q.difficulty || 'Médio',
      type: q.type || 'Múltipla escolha',
      is_anulada: Boolean(q.isAnulada || q.is_anulada || ans === 'ANULADA' || ans === 'X'),
      statement: q.statement || '',
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: ans === 'X' ? 'ANULADA' : ans,
      commentary: q.commentary || 'Gabarito Oficial Homologado - ENARE/ENAMED.',
      images: Array.isArray(q.images) ? q.images : []
    };
  });

  console.log(`\n📋 Preparado lote de ${payloadToUpsert.length} questões padronizadas.`);
  console.log(`Amostra questão 1: [${payloadToUpsert[0].code}] ${payloadToUpsert[0].statement.slice(0, 80)}...`);
  console.log(`   Tema: ${payloadToUpsert[0].tema} | Foco: ${payloadToUpsert[0].foco} | Gabarito: ${payloadToUpsert[0].correct_answer}\n`);

  // 5. Upsert no Supabase em lotes seguros
  const BATCH_SIZE = 20;
  let successCount = 0;

  for (let i = 0; i < payloadToUpsert.length; i += BATCH_SIZE) {
    const batch = payloadToUpsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('questions')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Erro no lote ${i} - ${i + batch.length}:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`   ✅ Lote ${i + 1} a ${i + batch.length} enviado com sucesso (${successCount}/${payloadToUpsert.length})`);
    }
  }

  console.log(`\n🎉 Sincronização concluída! Total enviado com sucesso: ${successCount}`);

  // 6. Verificação final de censo no Supabase
  console.log('\n--- VERIFICAÇÃO DE CENSO NO SUPABASE ---');

  const { count: ginecoCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('banca', ['ENARE', 'ENARE/ENAMED'])
    .eq('especialidade', 'Ginecologia');

  const { count: obstCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('banca', ['ENARE', 'ENARE/ENAMED'])
    .eq('especialidade', 'Obstetrícia');

  console.log(`📊 ENARE -> Ginecologia : ${ginecoCount} questões (Esperado: ~61)`);
  console.log(`📊 ENARE -> Obstetrícia : ${obstCount} questões (Esperado: 70)`);
}

main().catch(console.error);
