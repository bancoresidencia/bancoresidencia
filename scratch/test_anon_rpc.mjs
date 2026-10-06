const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

async function testAnon() {
  console.log('Testing with anonKey only...');
  const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_questions_by_ids_secure_v2', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_ids: ["d1b3f9b0-53bb-4a18-b65a-cb4f7ccb5467"]
    })
  });
  console.log('get_questions_by_ids_secure_v2 status:', res.status);
  console.log('response:', (await res.text()).slice(0, 200));

  console.log('\nTesting get_filtered_questions_secure_v4 with anonKey only...');
  const res2 = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_filtered_questions_secure_v4', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      domain_filters: ["residencia"],
      page_number: 1,
      items_per_page: 2
    })
  });
  console.log('get_filtered_questions_secure_v4 status:', res2.status);
  console.log('response:', (await res2.text()).slice(0, 200));
}

testAnon();
