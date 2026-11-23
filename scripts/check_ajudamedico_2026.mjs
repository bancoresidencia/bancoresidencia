async function testAjuda() {
  const url = 'https://ajudamedico.com/tests/usp-sp-2026';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  console.log('Status:', res.status);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Find question links or numbers
    const matches = html.match(/\/tests\/usp-sp-2026\/\d+/g) || [];
    console.log('Found question links:', matches.length);
    console.log('Sample links:', matches.slice(0, 10));
  }
}

testAjuda().catch(console.error);
