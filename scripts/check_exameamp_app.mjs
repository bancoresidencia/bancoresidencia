async function checkExameAmpApp() {
  const u = 'https://exameamp-app.amp.org.br/';
  try {
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`[${res.status}] ${u}`);
    if (res.ok) {
      const text = await res.text();
      console.log('HTML length:', text.length);
      const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
      links.forEach(l => console.log(' ->', l));
    }
  } catch (e) {
    console.error(e.message);
  }
}
checkExameAmpApp();
