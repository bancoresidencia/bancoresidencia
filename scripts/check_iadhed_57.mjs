async function checkIadhed57() {
  const url = 'https://portal.iadhedconcursos.org/edital/ver/57';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
    console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '');
    
    // Find all links
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    const files = links.filter(l => l.includes('.pdf') || l.includes('arquivo') || l.includes('download'));
    console.log(`Found ${files.length} file links:`);
    for (const f of files) {
      console.log(' ->', f);
    }
  }
}
checkIadhed57();
