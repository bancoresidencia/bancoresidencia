import fs from 'fs';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

// Let's get the token directly by reading from localStorage via browser or testing with token
const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ikc4M0dqWlVNYUtCb0RCL08iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2J4ZWRwZG1ndmdhdGpkZnhneGlqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ZDU4OTIxYi1iZDM3LTRmZGUtOWVmZi1hNmM2NzNkNTVlMWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkxNDI3OTQ3LCJpYXQiOjE3OTA4MjMxNDcsImVtYWlsIjoiZi5yb2dlcm9jaGFAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMZGhaOXVEYUhDUWdPdkhqUEtrOG9nRDNqQmFqNE15aFZETm1mNnNhZ2lwWEkzN1E9czk2LWMiLCJlbWFpbCI6ImYucm9nZXJvY2hhQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJSb2dlciBSb2NoYSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJSb2dlciBSb2NoYSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xkaFo5dURhSENRZ092SGpQS2s4b2dEM2pCYWo0TXloVkRObWY2c2FnaXBYSTM3UT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5MTAxNjcyNjYzMjcyNjcyODgyIiwic3ViIjoiMTA5MTAxNjcyNjYzMjcyNjcyODgyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE3OTA4MjMxNDd9XSwic2Vzc2lvbl9pZCI6Ijg4MzM3YTFkLTQ5MTEtNDE5OC05NDY4LTUxOGJkZTg3ZGEyNiIsImlzX2Fub255bW91cyI6ZmFsc2V9.Z9gMYE-XR57FMliR8feGwo7XJz1PMrf5UXrjSfARoxY';

const idsData = JSON.parse(fs.readFileSync('data/ginecologia_ids_list.json', 'utf8'));
const sampleIds = idsData.ids.slice(0, 10);

async function run() {
  const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_questions_by_ids_secure_v2', {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question_ids: sampleIds })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Returned count:', data.length);
  if (data[0]) {
    console.log('Sample question title/stmt:', (data[0].question_content || '').slice(0, 80));
    console.log('Sample institution:', data[0].location?.name);
    console.log('Sample choices count:', data[0].response_choices?.length);
    console.log('Sample specialty:', data[0].specialty_v2?.name);
    console.log('Sample theme:', data[0].theme_v2?.name);
    console.log('Sample focus:', data[0].focus_v2?.name);
  }
}

run().catch(console.error);
