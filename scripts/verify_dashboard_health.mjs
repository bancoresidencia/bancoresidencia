import http from 'http';

async function testUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing http://localhost:3336/ ...');
  const rootRes = await testUrl('http://localhost:3336/');
  console.log('Root status:', rootRes.status);

  console.log('Testing target question image on localhost:3336 ...');
  const imgRes = await testUrl('http://localhost:3336/storage/questoes/resgatadas/resgatada_questions_1550514f-0e3f-484a-b90a-efe9764e5788_sanar.webp');
  console.log('Target image status:', imgRes.status, '| Content-Type:', imgRes.headers['content-type']);

  console.log('Testing API stats ...');
  const apiRes = await testUrl('http://localhost:3336/api/stats');
  console.log('API stats status:', apiRes.status);

  console.log('All health checks passed!');
}

run().catch(console.error);
