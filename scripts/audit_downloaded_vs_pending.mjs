import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function auditPendingByInstitution() {
  console.log('Consultando contagem de pendências por instituição no Supabase...');

  // Hubs correspondentes aos PDFs baixados
  const targets = [
    { name: 'SES-GO / Goiás', patterns: ['SES-GO%', 'SESGO%', 'UFG%', 'FUBOG%'] },
    { name: 'AMP / Paraná', patterns: ['AMP%', 'HMMSJP%', 'UEM%', 'UFPR%', 'PUCPR%'] },
    { name: 'Mário Gatti (Campinas)', patterns: ['HMG%'] },
    { name: 'São Camilo (HSC)', patterns: ['HSC%'] },
    { name: 'UNICAMP', patterns: ['UNICAMP%'] },
    { name: 'UERJ', patterns: ['UERJ%'] },
    { name: 'ABEM / Teste Progresso', patterns: ['ABEM%', 'TPN%'] },
    { name: 'USCS', patterns: ['USCS%'] }
  ];

  for (const tgt of targets) {
    let totalPending = 0;
    let totalWithAns = 0;
    const details = [];

    for (const pat of tgt.patterns) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, code, year, correct_answer')
        .ilike('code', pat);

      if (!error && data) {
        const pending = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
        const withAns = data.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
        totalPending += pending.length;
        totalWithAns += withAns.length;
        if (data.length > 0) {
          details.push(`${pat.replace('%', '')}: ${pending.length} pendentes / ${data.length} total`);
        }
      }
    }
    console.log(`\n=== ${tgt.name} ===`);
    console.log(`Total Pendentes: ${totalPending} | Já com gabarito: ${totalWithAns}`);
    console.log(`Detalhes: ${details.join(', ')}`);
  }
}

auditPendingByInstitution();
