async function checkUnifesp() {
  const url = 'https://sanarmed.com/questoes-de-concursos/prova/unifesp/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  // Find all years
  const yearMatches = [...html.matchAll(/href="([^"]*\/prova\/unifesp\/\d{4}\/?)"/gi)].map(m => m[1]);
  console.log('UNIFESP years count:', yearMatches.length);
  console.log('Years sample:', yearMatches);

  // Check what question links appear on the main UNIFESP page
  const qLinks = [...html.matchAll(/href="(https:\/\/sanarmed\.com\/q\/[^"]+)"/gi)].map(m => m[1]);
  console.log('Question links directly on main UNIFESP page:', qLinks.length);

  // Check if there is an API or data payload in the page
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    if (s.includes('973') || s.includes('unifesp') && s.includes('total')) {
      console.log('Found script snippet:', s.slice(0, 300));
    }
  }
}

checkUnifesp().catch(console.error);
