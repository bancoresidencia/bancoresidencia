import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getCounts() {
  console.log('Consultando dados oficiais no Supabase...');

  // 1. Total questions
  const { count: totalCount, error: err1 } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  // 2. Questions without correct_answer
  const { count: nullCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .is('correct_answer', null);

  const { count: emptyCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('correct_answer', '');

  const totalMissing = (nullCount || 0) + (emptyCount || 0);
  const totalWithAnswer = (totalCount || 0) - totalMissing;

  console.log('--- SUPABASE (STATUS ATUAL) ---');
  console.log(`Total geral de questões no banco: ${totalCount}`);
  console.log(`Questões COM gabarito: ${totalWithAnswer}`);
  console.log(`Questões FALTANDO gabarito (pendentes): ${totalMissing}`);

  // 3. Staging Local
  console.log('\n--- STAGING LOCAL (PRONTAS PARA APLICAÇÃO) ---');
  const uniqueStaged = new Map();

  // A) staging_homologados_85pct.json
  const p85 = 'data/staging_homologados_85pct.json';
  if (fs.existsSync(p85)) {
    const d = JSON.parse(fs.readFileSync(p85, 'utf8').replace(/^\uFEFF/, ''));
    (d.decisoes || []).forEach(x => {
      uniqueStaged.set(x.id || x.code, { ...x, origem: 'PDFs Oficiais (Dual-Gate >= 85%)' });
    });
    console.log(`staging_homologados_85pct.json: ${d.decisoes?.length || 0} questões`);
  }

  // B) staging_lote_1 a 10
  let lotesTotal = 0;
  for (let i = 1; i <= 10; i++) {
    const p = `data/staging_lote_${i}.json`;
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
      const decs = d.decisoes || [];
      lotesTotal += decs.length;
      decs.forEach(x => {
        if (!uniqueStaged.has(x.id || x.code)) {
          uniqueStaged.set(x.id || x.code, { ...x, origem: `Worker Lote ${i} (Web QAPage)` });
        }
      });
    }
  }
  console.log(`staging_lote_1 a 10 (soma bruta): ${lotesTotal} questões`);
  console.log(`Total de questões ÚNICAS homologadas e prontas em staging: ${uniqueStaged.size}`);

  // Detalhe por instituição das prontas em staging
  const porInst = {};
  for (const [k, v] of uniqueStaged.entries()) {
    const inst = (v.code || '').split('-')[0] || v.banca || v.institution || 'Outros';
    porInst[inst] = (porInst[inst] || 0) + 1;
  }
  console.log('Distribuição por banca/código das prontas em staging:', porInst);
}

getCounts().catch(console.error);
