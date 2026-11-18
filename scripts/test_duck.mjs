async function testDuck() {
  const q = '"Em um ECG de superfície, qual evento elétrico corresponde à onda P?"';
  const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q), {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' }
  });
  const html = await res.text();
  const links = [];
  const matches = html.matchAll(/href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/g);
  for (const m of matches) {
    links.push(decodeURIComponent(m[1]));
  }
  console.log('DuckDuckGo HTML encontrou links:', links.length);
  links.slice(0, 8).forEach(l => console.log('  -> ' + l));
}

testDuck();
