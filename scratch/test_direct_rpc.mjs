// Native fetch is available in Node 18+

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';
const sampleIds = [
  "d1b3f9b0-53bb-4a18-b65a-cb4f7ccb5467",
  "e303870f-e906-4a7a-9c43-dd09d4cb38b6"
];

async function run() {
  const res = await fetch('https://bxedpdmgvgatjdfxgxij.supabase.co/rest/v1/rpc/get_bulk_gabarito', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_question_ids: sampleIds })
  });

  console.log('Status:', res.status);
  const data = await res.text();
  console.log('Result:', data);
}

run();
