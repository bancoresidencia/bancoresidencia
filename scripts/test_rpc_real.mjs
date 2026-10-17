import fs from 'fs';

const session = JSON.parse(fs.readFileSync('scripts/medevo_session.json', 'utf8'));
const auth = JSON.parse(session.value);
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

async function main() {
  const res = await fetch('https://data.medevo.com.br/rest/v1/rpc/get_study_material_content_secure', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': 'Bearer ' + auth.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_material_id: 'ba37ffde-f698-4e4e-9847-095859a6fa8f' })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data type:', typeof data);
  if (data && typeof data === 'object') {
    console.log('Keys:', Object.keys(data));
    console.log('Sample content preview:\n', JSON.stringify(data).slice(0, 500));
  } else {
    console.log('Content string length:', typeof data === 'string' ? data.length : data);
    console.log('Preview:', typeof data === 'string' ? data.slice(0, 300) : data);
  }
}

main().catch(console.error);
