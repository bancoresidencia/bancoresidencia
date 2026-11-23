async function inspect() {
  const res = await fetch('https://sanarmed.com/questoes-de-concursos/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  // Find form and input elements
  const inputs = [...html.matchAll(/<(input|select)[^>]+name="([^"]+)"[^>]*>/gi)];
  console.log('Filter inputs:');
  inputs.forEach(i => console.log('  ', i[0].slice(0, 100)));

  // Check how many questions are listed on each page
  const qLinks = [...html.matchAll(/href="https:\/\/sanarmed\.com\/q\/[^"]+"/gi)];
  console.log('Question links on main listing:', qLinks.length);

  // Check pagination on /questoes-de-concursos/
  const pag = [...html.matchAll(/href="([^"]*page[^"]*|\?paged=[^"]*|\/page\/[^"]*)"/gi)].map(m => m[1]);
  console.log('Pagination links on main listing:', [...new Set(pag)].slice(0, 10));
}

inspect().catch(console.error);
