import fs from 'fs';
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function loadAllIds(table = 'questions_direto') {
  const t0 = Date.now();
  console.log(`📡 Carregando todos os IDs pendentes de [${table}]...`);
  
  // Primeiro, pega a contagem exata
  const countRes = await fetch(`${url}/rest/v1/${table}?especialidade=is.null&select=id`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Range': '0-0', 'Prefer': 'count=exact' }
  });
  const total = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0', 10);
  console.log(`Total elegível: ${total} registros.`);

  const allIds = [];
  const PAGE_SIZE = 1000;
  
  // Busca em paralelo com concorrência controlada (6 requisições simultâneas)
  const ranges = [];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    ranges.push([offset, Math.min(offset + PAGE_SIZE - 1, total - 1)]);
  }

  for (let i = 0; i < ranges.length; i += 6) {
    const chunk = ranges.slice(i, i + 6);
    await Promise.all(chunk.map(async ([start, end]) => {
      const res = await fetch(`${url}/rest/v1/${table}?especialidade=is.null&select=id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Range': `${start}-${end}` }
      });
      const data = await res.json();
      allIds.push(...data.map(r => r.id));
    }));
    process.stdout.write(`  Carregados: ${allIds.length} / ${total}\r`);
  }

  console.log(`\n✅ ${allIds.length} IDs carregados com sucesso em ${((Date.now() - t0) / 1000).toFixed(2)}s!`);
}
loadAllIds();

