import fs from 'fs';
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkRange() {
  const t0 = Date.now();
  console.log('Testing Range 1000-1999 without order...');
  const res = await fetch(`${url}/rest/v1/questions_direto?select=id&especialidade=is.null`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Range': '1000-1999'
    }
  });
  const data = await res.json();
  console.log(`Fetched ${data.length} IDs in ${Date.now() - t0}ms, first ID: ${data[0]?.id}, last ID: ${data[data.length-1]?.id}`);
}
checkRange();

