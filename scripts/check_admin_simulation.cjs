const https = require('https');
const fs = require('fs');

const chunks = [
  'assets/AppSimulationPage-BR1ZpWos.js',
  'assets/AppEnamedSimulatorPage-Oq94yeDv.js',
  'admin-assets/Dn4AHUuh.js',
  'admin-assets/Cf7B0u9_.js',
  'admin-assets/Dy-ajvV7.js',
  'admin-assets/vDaRa7S1.js',
  'admin-assets/CDPRHJdL.js'
];

async function download(path) {
  return new Promise((resolve) => {
    https.get(`https://app.resify.com.br/${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.status, data });
      });
    }).on('error', () => resolve({ path, status: 500, data: '' }));
  });
}

async function run() {
  for (const c of chunks) {
    const res = await download(c);
    const apis = res.data.match(/["'`]\/api\/[^"'`\s]+["'`]/g) || [];
    console.log(`=== ${c} (${res.data.length} bytes) ===`);
    console.log([...new Set(apis)]);
  }
}

run();

