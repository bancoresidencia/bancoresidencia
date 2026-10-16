import https from 'https';
import http from 'http';

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Too many redirects'));
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const origin = new URL(url).origin;
          redirectUrl = new URL(redirectUrl, origin).href;
        }
        console.log(`  ↪ Redirect ${res.statusCode} to: ${redirectUrl}`);
        return fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
  });
}

async function test(name, url) {
  console.log(`\nTesting ${name}: ${url}`);
  try {
    const res = await fetchUrl(url);
    console.log(`  Status: ${res.status} | Body length: ${res.body.length}`);
    const hrefs = res.body.match(/href=["'][^"']+["']/gi) || [];
    console.log(`  Total hrefs: ${hrefs.length}`);
    const sample = hrefs.filter(h => /pdf|concurso|edital|prova|gabarito|residencia/i.test(h)).slice(0, 10);
    sample.forEach(s => console.log('   ', s));
  } catch(e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function main() {
  await test('UNICAMP FCM', 'https://portal.fcm.unicamp.br/pos-graduacao/residencia-medica/');
  await test('SURCE ARES', 'https://www.resmedceara.ufc.br/ares/');
  await test('FAURGS', 'https://portalfaurgs.com.br/concursos/');
  await test('VERBENA UFG', 'https://sistemas.institutoverbena.ufg.br/');
}

main().catch(console.error);
