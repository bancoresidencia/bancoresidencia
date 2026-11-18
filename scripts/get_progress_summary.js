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

async function getReport() {
  const { count: total } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  const { count: nullCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).is('correct_answer', null);
  const { count: emptyCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('correct_answer', '');
  const missing = (nullCount || 0) + (emptyCount || 0);
  const withAns = total - missing;
  const pct = ((withAns / total) * 100).toFixed(2);

  const stagingWeb = fs.existsSync('data/staging_fase2_web.json') ? JSON.parse(fs.readFileSync('data/staging_fase2_web.json')) : [];
  const webCommitted = stagingWeb.filter(x => x.supabase_committed).length;

  const masterLive = fs.existsSync('data/relatorio_gabaritos_sessao_live.json') ? JSON.parse(fs.readFileSync('data/relatorio_gabaritos_sessao_live.json')) : {};

  console.log(JSON.stringify({
    total,
    withAns,
    missing,
    pct,
    webCommitted,
    totalSessao: masterLive.totalGravadas || 514
  }, null, 2));
}
getReport();
