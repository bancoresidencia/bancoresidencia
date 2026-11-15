import fs from 'fs';

const html = fs.readFileSync('data/sample_ddg.html', 'utf8');

// Check results in DDG
const resultRegex = /<a class="result__snippet[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
const urlRegex = /<a class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
const titleRegex = /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

let match;
let i = 0;
while ((match = titleRegex.exec(html)) !== null && i < 5) {
  i++;
  console.log(`\n[DDG ${i}]`);
  console.log('URL:', match[1]);
  console.log('Title:', match[2].replace(/<[^>]+>/g, '').trim());
}
