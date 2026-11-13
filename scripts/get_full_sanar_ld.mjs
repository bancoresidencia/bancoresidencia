import fs from 'fs';

async function getFullLd() {
  const url = 'https://sanarmed.com/q/laura-um-lactente-de-dois-anos/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      console.log('Parsed type:', parsed['@type'] || (parsed['@graph'] ? 'Graph' : 'other'));
      if (parsed['@graph']) {
        parsed['@graph'].forEach(item => {
          if (item['@type'] === 'Question' || item['@type'] === 'QAPage') {
            console.log('Graph Item:', item);
          }
        });
      } else if (parsed['@type'] === 'QAPage' || parsed['@type'] === 'Question') {
        console.log('Direct Item:', parsed);
      }
    } catch (e) {}
  }
}

getFullLd();
