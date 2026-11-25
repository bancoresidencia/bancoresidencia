const res = await fetch('https://oslermedicina.com.br/questoes/ped-fmusp-2021-0c64ccfd01cd4c0182387721f1ea4c1a', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
});
const html = await res.text();
console.log('HTML length:', html.length);
const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
for (const m of imgMatches) {
  console.log('Image:', m[1]);
}
const cdnMatches = html.matchAll(/\/api\/images\/[^\s"'>]+/gi);
for (const m of cdnMatches) {
  console.log('CDN Image:', m[0]);
}
