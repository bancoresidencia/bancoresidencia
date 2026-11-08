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

async function run() {
  const qs = JSON.parse(fs.readFileSync('data/obstetricia_final_questions.json', 'utf8'));
  const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];

  const homologadasLocal = qs.filter(q => {
    const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
    return validAnswers.includes(ans);
  });

  const withCommLocal = homologadasLocal.filter(q => q.commentary && q.commentary.length >= 200);
  const withoutCommLocal = homologadasLocal.filter(q => !q.commentary || q.commentary.length < 200);

  const textPureWithoutComm = withoutCommLocal.filter(q => !checkHasImage(q));
  const imageWithoutComm = withoutCommLocal.filter(q => checkHasImage(q));

  console.log('='.repeat(70));
  console.log('📊 AUDITORIA OBSTETRÍCIA — BASE LOCAL:');
  console.log('='.repeat(70));
  console.log('- Total de Questões no arquivo:', qs.length.toLocaleString('pt-BR'));
  console.log('- Total com Gabarito Homologado:', homologadasLocal.length.toLocaleString('pt-BR'));
  console.log('- Homologadas COM Comentário (>= 200 carac):', withCommLocal.length.toLocaleString('pt-BR'));
  console.log('- Homologadas SEM Comentário:', withoutCommLocal.length.toLocaleString('pt-BR'));
  console.log('  * Pendentes Texto Puro (Esteira Gratuita):', textPureWithoutComm.length);
  console.log('  * Pendentes com Imagem (Requer Visão Computacional):', imageWithoutComm.length);

  // Consulta no Supabase
  const [{ count: totalSupa }, { count: homSupa }, { count: anyCommSupa }, { count: goldSupa }] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', 'Obstetrícia'),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', 'Obstetrícia').eq('has_gabarito', true),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', 'Obstetrícia').eq('has_gabarito', true).not('commentary', 'is', null).neq('commentary', ''),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', 'Obstetrícia').eq('has_gabarito', true).like('commentary', '%Take-Home Message:%')
  ]);

  console.log('\n' + '='.repeat(70));
  console.log('☁️ AUDITORIA OBSTETRÍCIA — BASE SUPABASE (PRODUÇÃO):');
  console.log('='.repeat(70));
  console.log('- Total de Questões no Supabase:', (totalSupa || 0).toLocaleString('pt-BR'));
  console.log('- Total Homologadas no Supabase:', (homSupa || 0).toLocaleString('pt-BR'));
  console.log('- Homologadas com Qualquer Comentário:', (anyCommSupa || 0).toLocaleString('pt-BR'));
  console.log('- Homologadas com Padrão-Ouro (Take-Home Message):', (goldSupa || 0).toLocaleString('pt-BR'));
  console.log('- Homologadas Pendentes de Comentário:', ((homSupa || 0) - (anyCommSupa || 0)).toLocaleString('pt-BR'));
  console.log('- Homologadas Pendentes de Padrão-Ouro:', ((homSupa || 0) - (goldSupa || 0)).toLocaleString('pt-BR'));
}

run();

