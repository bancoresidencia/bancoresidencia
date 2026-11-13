async function checkQcPage() {
  const url = 'https://www.qconcursos.com/questoes-de-concursos/questoes/176faa77-e2';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Find breadcrumbs, metadata, exam info
    const meta = html.match(/<div class="q-question-info[^>]*>([\s\S]*?)<\/div>/i) ||
                 html.match(/<div class="q-meta[^>]*>([\s\S]*?)<\/div>/i) ||
                 html.match(/<ol class="breadcrumb[^>]*>([\s\S]*?)<\/ol>/i);
    if (meta) {
      console.log('Meta:', meta[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    } else {
      // print first 1500 chars of body
      console.log(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1500));
    }
  }
}
checkQcPage();
