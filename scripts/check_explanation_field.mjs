import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkExplanations() {
  const { data: hmmsjp } = await supabase
    .from('questions')
    .select('id, code, year, options, correct_answer')
    .ilike('code', 'HMMSJP%')
    .or('correct_answer.is.null,correct_answer.eq.');

  let comExplicacao = 0;
  let detectados = 0;
  const amostra = [];

  for (const q of hmmsjp) {
    if (!Array.isArray(q.options)) continue;
    const hasExp = q.options.some(o => o.explanation && o.explanation.trim().length > 0);
    if (hasExp) {
      comExplicacao++;
      
      // Procura qual opção tem no texto de explanation termos de confirmação categórica:
      // "esta é a opção correta", "é a alternativa correta", "padrão-ouro", "assertiva correta", "gabarito oficial"
      let cand = null;
      for (const opt of q.options) {
        const exp = (opt.explanation || '').toLowerCase();
        if (
          exp.includes('opção correta') || 
          exp.includes('alternativa correta') || 
          exp.includes('assertiva correta') || 
          exp.includes('resposta correta') ||
          exp.includes('gabarito') ||
          exp.includes('conduta correta')
        ) {
          cand = opt.letter;
          break;
        }
      }
      if (cand) {
        detectados++;
        if (amostra.length < 5) {
          amostra.push({ code: q.code, letter: cand, expSnippet: q.options.find(o => o.letter === cand).explanation.slice(0, 150) });
        }
      }
    }
  }

  console.log(`Total HMMSJP pendentes: ${hmmsjp.length}`);
  console.log(`Pendentes com campo explanation nas opções: ${comExplicacao}`);
  console.log(`Com opção correta explicitamente descrita na explanation: ${detectados}`);
  console.log('Amostra:', amostra);
}

checkExplanations().catch(console.error);
