import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      let val = v.join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[k.trim()] = val;
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function checkHasImage(q) {
  if (q.imageUrl && q.imageUrl.trim() !== '') return true;
  if (q.image_url && q.image_url.trim() !== '') return true;
  if (Array.isArray(q.images) && q.images.length > 0) return true;
  const stmt = q.statement || '';
  if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(stmt)) return true;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (opt.imageUrl || opt.image_url) return true;
      if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(opt.text || '')) return true;
    }
  }
  return false;
}

const SPECIALTIES = [
  { name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json', supaName: 'Obstetrícia' },
  { name: 'Ginecologia', file: 'data/ginecologia_final_questions.json', supaName: 'Ginecologia' },
  { name: 'Pediatria', file: 'data/pediatria_final_questions.json', supaName: 'Pediatria' },
  { name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json', supaName: 'Clínica Médica' },
  { name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json', supaName: 'Cirurgia' },
  { name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json', supaName: 'Medicina Preventiva e Social' }
];

const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];

async function run() {
  console.log('='.repeat(80));
  console.log('🔍 CENSO COMPLETO: QUESTÕES HOMOLOGADAS SEM COMENTÁRIO POR ESPECIALIDADE');
  console.log('='.repeat(80));

  const localReport = [];
  const supaReport = [];

  for (const spec of SPECIALTIES) {
    // 1. Análise Local
    let totalLocal = 0;
    let homLocal = 0;
    let comCommLocal = 0;
    let pendingLocal = 0;
    let pendingPureLocal = 0;
    let pendingImgLocal = 0;

    if (fs.existsSync(spec.file)) {
      const qs = JSON.parse(fs.readFileSync(spec.file, 'utf8'));
      totalLocal = qs.length;

      const homList = qs.filter(q => {
        const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
        return validAnswers.includes(ans);
      });
      homLocal = homList.length;

      const withComm = homList.filter(q => q.commentary && q.commentary.length >= 200);
      comCommLocal = withComm.length;

      const withoutComm = homList.filter(q => !q.commentary || q.commentary.length < 200);
      pendingLocal = withoutComm.length;
      pendingPureLocal = withoutComm.filter(q => !checkHasImage(q)).length;
      pendingImgLocal = withoutComm.filter(q => checkHasImage(q)).length;
    }

    localReport.push({
      especialidade: spec.name,
      total: totalLocal,
      homologadas: homLocal,
      comComentario: comCommLocal,
      pctComentario: homLocal > 0 ? ((comCommLocal / homLocal) * 100).toFixed(1) + '%' : '0%',
      faltamTotal: pendingLocal,
      faltamTextoPuro: pendingPureLocal,
      faltamComImagem: pendingImgLocal
    });

    // 2. Análise Supabase
    // Buscar contagens por especialidade
    const [{ count: totalSupa }, { count: homSupa }, { count: commSupa }, { count: goldSupa }] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', spec.supaName),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', spec.supaName).eq('has_gabarito', true),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', spec.supaName).eq('has_gabarito', true).not('commentary', 'is', null).neq('commentary', ''),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', spec.supaName).eq('has_gabarito', true).like('commentary', '%Take-Home Message:%')
    ]);

    const missingCommSupa = (homSupa || 0) - (commSupa || 0);
    const missingGoldSupa = (homSupa || 0) - (goldSupa || 0);

    supaReport.push({
      especialidade: spec.name,
      totalSupa: totalSupa || 0,
      homSupa: homSupa || 0,
      commSupa: commSupa || 0,
      pctCommSupa: homSupa > 0 ? (((commSupa || 0) / homSupa) * 100).toFixed(1) + '%' : '0%',
      goldSupa: goldSupa || 0,
      pctGoldSupa: homSupa > 0 ? (((goldSupa || 0) / homSupa) * 100).toFixed(1) + '%' : '0%',
      faltamQualquer: missingCommSupa,
      faltamGold: missingGoldSupa
    });
  }

  // Também checar se existe "Cirurgia Geral" além de "Cirurgia" no Supabase
  const { count: cirurgiaGeralSupa } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('especialidade', 'Cirurgia Geral');

  console.log('\n--- 1. BASE LOCAL (Arquivos JSON) ---');
  console.table(localReport);

  console.log('\n--- 2. BASE ATIVA NO SUPABASE (Produção) ---');
  console.table(supaReport);
}

run();

