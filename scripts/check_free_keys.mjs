import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const paidValue = env.GEMINI_API_KEY_PAID;
const freeKeys = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .filter(k => !k.includes('PAID') && !k.includes('ON_DEMAND') && !k.includes('BILLING'))
  .map(k => ({ name: k, key: env[k] }))
  .filter(item => item.key && item.key !== paidValue);

const uniqueFreeKeys = [...new Set(freeKeys.map(i => i.key))];
console.log('Total free keys configured:', freeKeys.length);
console.log('Unique free keys (excluding paid key):', uniqueFreeKeys.length);
uniqueFreeKeys.forEach((k, idx) => console.log(`Key ${idx + 1}: ${k.slice(0, 8)}...${k.slice(-4)}`));

