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

  const text = await res.json();
  console.log('Final do texto (1500 chars):\n', text.slice(-1500));

  const urls = text.match(/https?:\/\/[^\s\)\"\'<>]+/g) || [];
  console.log('URLs encontradas no texto:', urls);

  // Procura menções de entidades / diretrizes
  const lines = text.split('\n');
  const refLines = lines.filter(l => l.toLowerCase().includes('diretriz') || l.toLowerCase().includes('referência') || l.toLowerCase().includes('consenso') || l.toLowerCase().includes('sociedade') || l.toLowerCase().includes('federação') || l.toLowerCase().includes('protocolo') || l.toLowerCase().includes('colégio') || l.toLowerCase().includes('associação'));
  console.log('Linhas com diretrizes/fontes citadas:', refLines);
}

main().catch(console.error);
