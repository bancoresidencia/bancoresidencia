import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function diagnose() {
  console.log("=== DIAGNÓSTICO DA MASSA DE 130 MIL QUESTÕES NO SUPABASE ===");

  // 1. Total geral na tabela questions
  const resTotal = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Range: '0-0',
      Prefer: 'count=planned'
    }
  });
  const crTotal = resTotal.headers.get('content-range');
  console.log('1. Total Geral de Questões no Supabase (planned):', crTotal ? crTotal.split('/')[1] : 'N/A');

  // 2. Questões com gabarito preenchido (not.is.null)
  const resWithAns = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=not.is.null&select=id`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Range: '0-0',
      Prefer: 'count=planned'
    }
  });
  const crWithAns = resWithAns.headers.get('content-range');
  console.log('2. Questões com gabarito preenchido (correct_answer != null):', crWithAns ? crWithAns.split('/')[1] : 'N/A');

  // 3. Questões sem gabarito (is.null)
  const resNoAns = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=is.null&select=id`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Range: '0-0',
      Prefer: 'count=planned'
    }
  });
  const crNoAns = resNoAns.headers.get('content-range');
  console.log('3. Questões sem gabarito (correct_answer == null):', crNoAns ? crNoAns.split('/')[1] : 'N/A');
}

diagnose().catch(console.error);
