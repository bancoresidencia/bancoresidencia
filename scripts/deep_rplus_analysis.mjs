import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchAllRPlusModalidades() {
  console.log('--- 1. Investigating distinct modalidade containing R+ ---');
  // We can fetch modalidade values for rows matching modalidade=ilike.*R%2B* with pagination
  // Or fetch batches of 1000
  let offset = 0;
  const limit = 1000;
  const modalidadeCounts = {};
  const institutionCounts = {};
  const comboCounts = {}; // modalidade + institution
  const codePrefixes = {};
  const sampleRows = [];

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?modalidade=ilike.*R%2B*&select=id,code,institution,banca,year,tipo_prova,modalidade,created_at&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) {
      console.error('Fetch error:', res.status, await res.text());
      break;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const q of data) {
      const m = q.modalidade || '(null)';
      modalidadeCounts[m] = (modalidadeCounts[m] || 0) + 1;

      const inst = q.institution || q.banca || 'SEM_INSTITUICAO';
      institutionCounts[inst] = (institutionCounts[inst] || 0) + 1;

      const combo = `${m} | ${inst}`;
      comboCounts[combo] = (comboCounts[combo] || 0) + 1;

      const prefix = (q.code || '').replace(/[0-9].*$/, '') || '(no code)';
      codePrefixes[prefix] = (codePrefixes[prefix] || 0) + 1;

      if (sampleRows.length < 10) {
        sampleRows.push(q);
      }
    }

    offset += data.length;
    if (offset % 10000 === 0 || data.length < limit) {
      console.log(`Fetched ${offset} questions...`);
    }
    if (data.length < limit) break;
  }

  console.log('\n=== MODALIDADES CONTAINING R+ ===');
  console.table(modalidadeCounts);

  console.log('\n=== TOTAL QUESTIONS WITH R+: ', offset);

  console.log('\n=== TOP 30 INSTITUTIONS ===');
  const sortedInst = Object.entries(institutionCounts).sort((a, b) => b[1] - a[1]);
  console.log(JSON.stringify(sortedInst.slice(0, 30), null, 2));
  console.log('Total distinct institutions:', sortedInst.length);

  console.log('\n=== CODE PREFIXES ===');
  const sortedPrefixes = Object.entries(codePrefixes).sort((a, b) => b[1] - a[1]);
  console.log(JSON.stringify(sortedPrefixes.slice(0, 30), null, 2));

  // Save full data to a json file for precise reporting
  fs.writeFileSync('scripts/rplus_census_results.json', JSON.stringify({
    totalRPlus: offset,
    modalidades: modalidadeCounts,
    institutions: Object.fromEntries(sortedInst),
    codePrefixes: Object.fromEntries(sortedPrefixes),
    samples: sampleRows
  }, null, 2));

  console.log('\nSaved full census to scripts/rplus_census_results.json');
}

fetchAllRPlusModalidades().catch(console.error);

