import https from 'https';

async function probe() {
  const years = [2022, 2023, 2024];
  const months = ['10', '11', '12', '01'];
  const base = 'https://www.resmedceara.ufc.br/ares/wp-content/uploads';

  // Let's fetch the main page to see links
  https.get('https://www.resmedceara.ufc.br/ares/', { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      console.log('HTML length:', html.length);
      const links = [...html.matchAll(/href=["']([^"']+\.pdf)["']/gi)].map(m => m[1]);
      console.log(`Found ${links.length} PDF links on SURCE homepage:`);
      for (const l of links.slice(0, 15)) console.log('  ->', l);
    });
  }).on('error', e => console.error(e.message));
}

probe();

