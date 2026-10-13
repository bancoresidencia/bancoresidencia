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

async function run() {
  console.log('Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  // 1. Count total questions
  const resTotal = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('Total questions status:', resTotal.status);
  console.log('Total content-range:', resTotal.headers.get('content-range'));

  // 2. Count questions with answer
  const resAns = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=not.is.null&select=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log('With answer status:', resAns.status);
  console.log('With answer content-range:', resAns.headers.get('content-range'));

  // 3. Let's check columns of questions table
  const resCol = await fetch(`${SUPABASE_URL}/rest/v1/questions?limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const data = await resCol.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log('Columns in questions table:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
  } else {
    console.log('No data or error:', data);
  }
}

run().catch(console.error);
