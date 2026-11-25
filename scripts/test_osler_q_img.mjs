const res = await fetch('https://oslermedicina.com.br/questoes/fmusp-2026-1e2375aedab24e8cae4834e1aee1bd8b', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
});
const text = await res.text();
const apiImgs = text.match(/\/api\/images\/content\/[^\s"'<>]+/gi) || [];
console.log('API content image:', apiImgs);
