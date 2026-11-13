async function testEngines() {
  const query = 'aferição da PA em crianças SanarMed';
  
  // 1. Bing
  try {
    const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    console.log('Bing status:', res.status);
    const html = await res.text();
    const linkMatches = [...html.matchAll(/href="(https:\/\/[^"]*sanarmed\.com\/q\/[^"]*)"/g)];
    console.log('Bing Sanar links:', linkMatches.map(m => m[1]));
  } catch (e) {
    console.log('Bing error:', e.message);
  }

  // 2. Yahoo
  try {
    const res = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    console.log('Yahoo status:', res.status);
    const html = await res.text();
    const linkMatches = [...html.matchAll(/href="(https:\/\/[^"]*sanarmed\.com\/q\/[^"]*)"/g)];
    console.log('Yahoo Sanar links:', linkMatches.map(m => m[1]));
  } catch (e) {
    console.log('Yahoo error:', e.message);
  }
}
testEngines();
