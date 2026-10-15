const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ezluharxlmlqhdkqrjbz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDkxNzcsImV4cCI6MjEwNjgyNTE3N30.kT9521OP3j5yTmnQTqF6Wzl29xc6ZjV2UzF8EB_5xrI');

const targets = [
  { name: 'SUS-BA', pattern: 'SUS-BA' },
  { name: 'SES-DF', pattern: 'SES-DF' },
  { name: 'IADES', pattern: 'IADES' },
  { name: 'FAMERP', pattern: 'FAMERP' },
  { name: 'Sirio-Libanes', pattern: 'Sirio' },
  { name: 'CERMAM', pattern: 'CERMAM' },
  { name: 'PUC-PR', pattern: 'PUC-PR' },
  { name: 'PUC-SP', pattern: 'PUC-SP' },
  { name: 'PUC-Campinas', pattern: 'PUC-Campinas' },
  { name: 'FUNDATEC', pattern: 'FUNDATEC' }
];

async function run() {
  console.log('--- DIAGNÓSTICO DO LOTE 3 ---');
  for (const t of targets) {
    const { count: tot } = await supabase.from('questions')
      .select('id', { count: 'exact', head: true })
      .or(`banca.ilike.%${t.pattern}%,institution.ilike.%${t.pattern}%`);
    
    let withAns = 0;
    if (tot && tot > 0) {
      const { count: ca, error } = await supabase.from('questions')
        .select('id', { count: 'exact', head: true })
        .or(`banca.ilike.%${t.pattern}%,institution.ilike.%${t.pattern}%`)
        .neq('correct_answer', '');
      withAns = (error || typeof ca !== 'number') ? 0 : ca;
    }

    const pct = tot > 0 ? ((withAns / tot) * 100).toFixed(1) : '0.0';
    console.log(`${t.name.padEnd(20)}: ${String(withAns).padStart(5)} / ${String(tot).padStart(5)} (${pct}%)`);
  }
}
run();
