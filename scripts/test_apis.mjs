async function testSanarApi() {
  const query = 'aferição da PA em crianças';
  // Check Sanar search endpoint
  const urls = [
    `https://sanarmed.com/api/search?q=${encodeURIComponent(query)}`,
    `https://sanarmed.com/api/questions?search=${encodeURIComponent(query)}`,
    `https://sanarmed.com/questoes-de-concursos/?q=${encodeURIComponent(query)}`,
    `https://sanarmed.com/busca/?q=${encodeURIComponent(query)}`
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(u, 'status:', res.status);
    } catch (e) {
      console.log(u, 'error:', e.message);
    }
  }
}
testSanarApi();
