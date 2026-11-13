async function checkSanarSearch() {
  const query = 'aferição da PA em crianças';
  const url = `https://sanarmed.com/questoes-de-concursos/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('Status:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);
  // Find all /q/ links
  const qLinks = [...html.matchAll(/href="(\/q\/[^"]+)"/g)];
  console.log('Links found:', qLinks.length);
  qLinks.slice(0, 5).forEach(m => console.log('  -> https://sanarmed.com' + m[1]));
}
checkSanarSearch();
