import https from 'https';
import fs from 'fs';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- PROBING UNICAMP RESIDÊNCIA ---');
  try {
    const urls = [
      'https://portal.fcm.unicamp.br/pos-graduacao/residencia-medica/processo-seletivo/',
      'https://portal.fcm.unicamp.br/pos-graduacao/residencia-medica/'
    ];
    for (const u of urls) {
      const html = await get(u);
      const links = html.match(/href=["'][^"']+\.pdf["']/gi) || [];
      console.log(`URL ${u}: ${links.length} links PDF`);
      links.forEach(l => {
        const clean = l.replace(/^href=["']|["']$/gi, '');
        if (/gabarito|prova|processo|acesso|direto|preliminar|definitivo/i.test(clean)) {
          console.log('   📄', clean);
        }
      });
    }
  } catch (e) {
    console.log('UNICAMP err:', e.message);
  }

  console.log('\n--- PROBING FAURGS (HCPA) ---');
  try {
    const html = await get('https://portalfaurgs.com.br/concursos/');
    const links = html.match(/href=["'][^"']+["']/gi) || [];
    const hcpaLinks = [];
    links.forEach(l => {
      const clean = l.replace(/^href=["']|["']$/gi, '');
      if (/hcpa|residencia|medica/i.test(clean)) {
        hcpaLinks.push(clean);
      }
    });
    console.log(`Encontrados ${hcpaLinks.length} links relacionados a HCPA/Residência`);
    hcpaLinks.slice(0, 15).forEach(l => console.log('   🏥', l));
  } catch (e) {
    console.log('FAURGS err:', e.message);
  }

  console.log('\n--- PROBING SURCE / ARES CEARÁ ---');
  try {
    const html = await get('https://www.resmedceara.ufc.br/ares/');
    const links = html.match(/href=["'][^"']+\.pdf["']/gi) || [];
    console.log(`Encontrados ${links.length} links PDF na página principal da SURCE`);
    links.forEach(l => {
      const clean = l.replace(/^href=["']|["']$/gi, '');
      if (/gabarito|prova|2024|2025|2026/i.test(clean)) {
        console.log('   🎯', clean);
      }
    });
  } catch (e) {
    console.log('SURCE err:', e.message);
  }
}

main().catch(console.error);
