async function checkPage() {
  const url = 'https://sanarmed.com/q/um-menino-de-9-anos-e-trazido-ao-consultorio-pelos/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
  const html = await res.text();
  console.log('HTML length:', html.length);
  // Find all ld+json
  const lds = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  console.log('LDs count:', lds.length);
  for (let i = 0; i < lds.length; i++) {
    try {
      const data = JSON.parse(lds[i][1]);
      console.log(`LD #${i} @type:`, data['@type']);
      if (data.mainEntity) console.log('mainEntity keys:', Object.keys(data.mainEntity));
      if (data.mainEntity?.acceptedAnswer) console.log('acceptedAnswer:', data.mainEntity.acceptedAnswer);
    } catch (e) {
      console.log(`LD #${i} parse error:`, e.message);
    }
  }
  // Check for HTML comment or text
  const ansMatches = [...html.matchAll(/(?:resposta|gabarito|correta)[^<]{0,100}/gi)];
  console.log('Text mentions:', ansMatches.map(m => m[0]).slice(0, 5));
}
checkPage();
