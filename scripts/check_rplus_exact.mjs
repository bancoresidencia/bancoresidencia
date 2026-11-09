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

async function getExactCount(queryParam) {
  const url = `${SUPABASE_URL}/rest/v1/questions?${queryParam}&select=id`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Range': '0-0',
          'Prefer': 'count=exact'
        }
      });
      if (res.status === 503) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      const cr = res.headers.get('content-range');
      if (cr) {
        const parts = cr.split('/');
        return parseInt(parts[1], 10);
      }
      return 0;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return 0;
}

async function findDistinctModalities() {
  console.log('--- Testing exact counts for R+ patterns ---');

  // Total questions in Supabase
  const total = await getExactCount('');
  console.log('Total questions in database:', total);

  // Exact total with modalidade ILIKE '%R+%'
  const totalRPlus = await getExactCount('modalidade=ilike.*R%2B*');
  console.log('Total questions with modalidade ILIKE "%R+%":', totalRPlus);

  // Let's check known R+ values
  const known = [
    'R+ Especialidades',
    'R+ Clínica Médica',
    'R+ Clínica',
    'R+ Endoscopia',
    'R+ Cirurgia',
    'R+ Pediatria',
    'R+ Ginecologia e Obstetrícia',
    'R+ Neuropediatria',
    'R+ Mastologia',
    'R+ Geriatria',
    'R+ Cardiologia',
    'R+ Nefrologia',
    'R+ Gastroenterologia',
    'R+ Hematologia',
    'R+ Infectologia',
    'R+ Pneumologia',
    'R+ Reumatologia',
    'R+ Medicina Intensiva',
    'R+ Medicina de Família e Comunidade',
    'R+ Ortopedia',
    'R+ Anestesiologia',
    'R+ Radiologia',
    'R+ Dermatologia',
    'R+ Oftalmologia',
    'R+ Otorrinolaringologia',
    'R+ Psiquiatria',
    'R+ Urologia'
  ];

  let sumKnown = 0;
  for (const k of known) {
    const c = await getExactCount(`modalidade=eq.${encodeURIComponent(k)}`);
    if (c > 0) {
      console.log(`- "${k}": ${c}`);
      sumKnown += c;
    }
  }
  console.log('Sum of known exact R+ values:', sumKnown);

  // If totalRPlus > sumKnown, let's find the remaining ones!
  if (totalRPlus > sumKnown) {
    console.log(`There are ${totalRPlus - sumKnown} remaining questions with R+! Let's find their exact modalidade strings...`);
  }

  // Let's also check other modalities that might be R+ related (e.g. R3, R4, Especialidades, Título)
  const otherChecks = [
    'modalidade=ilike.*R3*',
    'modalidade=ilike.*R4*',
    'modalidade=ilike.*R2*',
    'modalidade=ilike.*Especialidades*',
    'modalidade=ilike.*T%C3%ADtulo*',
    'tipo_prova=ilike.*R%2B*',
    'tipo_prova=ilike.*R3*',
    'tipo_prova=ilike.*R4*',
    'code=ilike.*R3*',
    'code=ilike.*R4*'
  ];

  for (const oc of otherChecks) {
    const c = await getExactCount(oc);
    console.log(`Pattern [${oc}]: ${c}`);
  }
}

findDistinctModalities().catch(console.error);

