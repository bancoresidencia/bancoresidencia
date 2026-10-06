import fs from 'fs';

const authRaw = fs.readFileSync('C:/Users/froge/.gemini/antigravity-ide/brain/337ff5f0-a184-4c0b-826b-2f4083b86910/scratch/collect_ginecologia_gabaritos.mjs', 'utf8');
const tokenMatch = authRaw.match(/const token = '([^']+)';/);
const token = tokenMatch ? tokenMatch[1] : null;

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

async function test() {
  console.log('Testing Supabase RPC with token...');
  const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_filtered_questions_secure_v4', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      domain: 'residencia',
      items_per_page: 5,
      page_number: 1
    })
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text.slice(0, 300));
}

test();
