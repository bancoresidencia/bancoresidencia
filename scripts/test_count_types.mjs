import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function testEstimated() {
  const inst = 'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)';
  for (const countType of ['exact', 'planned', 'estimated']) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Range': '0-0',
          'Prefer': `count=${countType}`
        }
      });
      console.log(`[${countType}] status=${res.status}, cr=${res.headers.get('content-range')}, time=${Date.now() - t0}ms`);
    } catch (e) {
      console.log(`[${countType}] error:`, e.message);
    }
  }
}

testEstimated().catch(console.error);
