async function inspectEdital18And19() {
  for (const id of [18, 19]) {
    const u = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    console.log(`=== EDITAL ${id} ===`);
    // Find all links to files
    const fileMatches = [...text.matchAll(/arquivo\.php\?file=([^"'>\s]+)/gi)];
    fileMatches.forEach(m => console.log(' -> file:', m[1]));
    // Also find any text mentioning prova, gabarito, fubog
    const regex = /<tr[\s\S]*?<\/tr>/gi;
    let trMatch;
    while ((trMatch = regex.exec(text)) !== null) {
      const row = trMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (row.toLowerCase().includes('prova') || row.toLowerCase().includes('gabarito') || row.toLowerCase().includes('resultado') || row.toLowerCase().includes('caderno')) {
        console.log('   Row:', row);
      }
    }
  }
}
inspectEdital18And19();

