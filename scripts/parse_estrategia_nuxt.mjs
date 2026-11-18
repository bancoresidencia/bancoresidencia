import fs from 'fs';
import vm from 'vm';

const html = fs.readFileSync('scripts/estrategia_sample.html', 'utf8');
const match = html.match(/window\.__NUXT__\s*=\s*([\s\S]*?);<\/script>/);
if (match) {
  const code = match[1];
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(`window.__NUXT__ = ${code};`, sandbox);
  const nuxt = sandbox.window.__NUXT__;
  console.log('Nuxt keys:', Object.keys(nuxt));
  console.log('fetch keys:', Object.keys(nuxt.fetch || {}));
  const fetchKey = Object.keys(nuxt.fetch || {})[0];
  const qData = nuxt.fetch[fetchKey]?.question;
  if (qData) {
    console.log('Question keys:', Object.keys(qData));
    console.log('ID:', qData.id);
    console.log('Alternatives count:', qData.alternatives?.length);
    if (qData.alternatives) {
      qData.alternatives.forEach((alt, idx) => {
        console.log(`[${String.fromCharCode(65 + idx)}] is_correct: ${alt.is_correct} / correct: ${alt.correct} | text: ${alt.text?.slice(0, 50)}`);
      });
    }
    console.log('Full alternatives dump:', JSON.stringify(qData.alternatives));
  }
}
