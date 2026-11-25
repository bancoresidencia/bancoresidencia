const res = await fetch('https://provaderesidencia.com.br/demo/questao/80043/usp-sp-sp-2017-r3-cirurgia-geral-questao-4', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
});
const html = await res.text();
console.log('Status:', res.status, 'HTML len:', html.length);
const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
for (const m of matches) {
  console.log('Image:', m[1]);
}
