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

async function testBoth() {
  console.log('SUPABASE_URL:', SUPABASE_URL);

  // Test 1: plain questions
  const res1 = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('res1 status:', res1.status, 'content-range:', res1.headers.get('content-range'));

  // Test 2: with queryParam = '' (which makes ?&select=id)
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/questions?&select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('res2 status:', res2.status, 'content-range:', res2.headers.get('content-range'));

  // Test 3: R+ Especialidades
  const res3 = await fetch(`${SUPABASE_URL}/rest/v1/questions?modalidade=eq.${encodeURIComponent('R+ Especialidades')}&select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('res3 R+ Especialidades:', res3.status, 'content-range:', res3.headers.get('content-range'));

  // Test 4: R+ Clínica Médica
  const res4 = await fetch(`${SUPABASE_URL}/rest/v1/questions?modalidade=eq.${encodeURIComponent('R+ Clínica Médica')}&select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('res4 R+ Clínica Médica:', res4.status, 'content-range:', res4.headers.get('content-range'));

  // Test 5: What is 132947? Is it is_anulada=false or something?
  const res5 = await fetch(`${SUPABASE_URL}/rest/v1/questions?is_anulada=eq.false&select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('res5 is_anulada=false:', res5.status, 'content-range:', res5.headers.get('content-range'));
}

testBoth().catch(console.error);

