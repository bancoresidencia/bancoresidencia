async function fetchAbemPage() {
  const url = 'https://website.abem-educmed.org.br/index.php/teste-de-progresso/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('ABEM status:', res.status);
  const html = await res.text();
  console.log('ABEM length:', html.length);
  // Find all .pdf links
  const pdfRegex = /href="([^"]+\.pdf)"/gi;
  let m;
  const pdfs = [];
  while ((m = pdfRegex.exec(html)) !== null) {
    pdfs.push(m[1]);
  }
  console.log('PDFs found on ABEM page:', pdfs.length);
  pdfs.forEach(p => console.log('  ->', p));
}
fetchAbemPage();

