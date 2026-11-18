import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const idx = l.indexOf('=');
    if (idx !== -1) {
      const k = l.substring(0, idx).trim();
      const v = l.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (k) env[k] = v;
    }
  });
}

const paidKeys = [env.GEMINI_API_KEY_PAID, env.GEMINI_API_KEY_ON_DEMAND].filter(Boolean);
console.log('Paid keys count:', paidKeys.length, 'Endings:', paidKeys.map(k => k.slice(-6)));

const freeKeys = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .filter(k => !k.includes('PAID') && !k.includes('DEMAND') && !k.includes('BILLING'))
  .map(k => ({ name: k, key: env[k], ending: env[k].slice(-6) }))
  .filter(item => !paidKeys.includes(item.key));

console.log('Free keys count:', freeKeys.length);
freeKeys.forEach(f => console.log(' ', f.name, 'ending:', f.ending));
