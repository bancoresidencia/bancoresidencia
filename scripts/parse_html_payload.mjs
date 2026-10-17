import fs from 'fs';

const html = fs.readFileSync('scripts/gemini_main_page.html', 'utf8');

// Look for __BG3_DATA__ or AF_initDataCallback
const bg3Match = html.match(/__BG3_DATA__\s*=\s*({[\s\S]*?});/);
if (bg3Match) {
  console.log('Found __BG3_DATA__ length:', bg3Match[1].length);
  fs.writeFileSync('scripts/bg3_data.json', bg3Match[1]);
} else {
  console.log('No direct __BG3_DATA__ match');
}

// Search for any AF_initDataCallback
const callbacks = html.match(/AF_initDataCallback\({[\s\S]*?}\);/g) || [];
console.log('Found AF_initDataCallbacks:', callbacks.length);
callbacks.forEach((cb, i) => {
  fs.writeFileSync(`scripts/af_callback_${i}.js`, cb);
  console.log(`Callback ${i} length: ${cb.length}`);
});

// Search for snippets mentioning App or React or JSX
const appMatches = [];
let idx = 0;
while ((idx = html.indexOf('App.jsx', idx)) !== -1) {
  appMatches.push(html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 800)));
  idx += 7;
}
console.log('App.jsx occurrences:', appMatches.length);
if (appMatches.length) {
  console.log('Snippet 0:\n', appMatches[0]);
}

// Search for "share" or conversation title or user prompt
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
console.log('Page title:', titleMatch ? titleMatch[1] : null);
