async function fetchVerbena() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('Length:', html.length);
    const pdfRegex = /href="([^"]+\.pdf)"/gi;
    let m;
    const pdfs = [];
    while ((m = pdfRegex.exec(html)) !== null) {
      pdfs.push(m[1]);
    }
    console.log('PDFs found on Verbena page:', pdfs.length);
    pdfs.forEach(p => console.log('  ->', p));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
fetchVerbena();

