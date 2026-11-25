import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

const instRes = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const instData = (await instRes.json()).data || [];

console.log(`Remaining watermarked in catalog: ${cat.length}`);
console.log(`Sanar institutions available: ${instData.length}`);

function cleanStr(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const remainingBancas = new Map();
for (const item of cat) {
  const b = item.banca || 'UNKNOWN';
  remainingBancas.set(b, (remainingBancas.get(b) || 0) + 1);
}

// Special overrides map for known aliases
const explicitMap = {
  'UNICAMP/HC': '4b4d516b-7bb3-459e-9740-62a44813a501',
  'SURCE': '490fc1db-5a5c-480c-aa1e-06a10c2c3d21',
  'Centro Universitário FMABC': 'ed5ab9ff-76de-4a82-a5e4-791453936ce9',
  'FMABC': 'ed5ab9ff-76de-4a82-a5e4-791453936ce9',
  'UNESP/HCFMB': '150cb8d4-1b1b-4b97-ae98-ba2a3f1c5993',
  'UNESP': '150cb8d4-1b1b-4b97-ae98-ba2a3f1c5993',
  'Universidade de Taubaté': '346aa089-7e29-40d9-99d5-cf45cfeb18fa',
  'UNITAU': '346aa089-7e29-40d9-99d5-cf45cfeb18fa',
  'UFT': '1a5ad2cb-7537-4aa7-9f61-d75e0dbc1d9c',
  'HIAE/Einstein': 'a0198980-91ac-48d1-9fdf-a037cf1a4db1',
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)': 'abd041af-b585-4fcf-8792-7805682ff08a',
  'UFRGS/HCPA': 'abd041af-b585-4fcf-8792-7805682ff08a',
  'UNIFESP/EPM': '818083e3-bb53-49a2-ba73-7d5a1870d36b',
  'Santa Casa de São Paulo': '724ea400-bd28-4a6d-b40d-1ba5276e53fd',
  'Pontifícia Universidade Católica de São Paulo': 'e04674ea-c83d-4993-9a57-cc4d71520604',
  'PUC-SP': 'e04674ea-c83d-4993-9a57-cc4d71520604',
  'HAC': '9f792eca-26ce-4db7-9aee-9ac1d8ee4b5a',
  'HSL/Sírio': '81a61e16-0aea-4c1d-945e-b8b9e107f45a',
  'UFSC/HU': '313e9edc-5e75-4fbc-b839-199c5bf3b26d',
  'UERJ/HUPE': '689a1bb3-51e0-40ba-a068-0f82cde55a21',
  'HSL Copacabana': '7f51443e-6f3e-46cc-a282-d9e89dc42d7c',
  'HAS': '23733f66-96e2-40f0-bc94-995407d00a53',
  'AMRIGS': '5bca3795-dd2c-4741-b771-a9554e44ad2e',
  'IDOR': '74e37d82-c9a9-425d-9af6-1c79c9df4e9f',
  'HSL PUCRS': '4162d709-3de7-4c49-9565-825d02b839c0',
  'UFRN/HUOL': 'e3864cba-028b-4d57-97e7-52d0277ea89c',
  'USP/HCFMUSP': '438e2592-cecd-4b9c-8c66-701f0464b120',
  'USP/HCRP': 'a2153355-9681-48dd-8e71-108709f62709',
  'USP': '438e2592-cecd-4b9c-8c66-701f0464b120',
  'FAMERP': 'ff191062-8178-433b-a912-78d10b7b1ce7',
  'SES-PE': '64e8e81c-8e54-4634-93ff-1845f0967393',
  'SES-GO': '6cebe5df-3a47-49f3-8581-ca41bb92b761',
  'SES-RJ': '9b7f5254-20f5-46aa-ab3c-a9fe53235db3',
  'IAMSPE': '868e44fc-68b0-498d-809d-387a60f53330',
  'SCMC - MT': '5c28ad41-bb03-4554-b4bf-5a9e3381a1a9'
};

const matchedTargets = [];
const seenSanarIds = new Set();

for (const [ourBanca, count] of remainingBancas.entries()) {
  let sanarId = explicitMap[ourBanca];
  let sanarName = '';

  if (sanarId) {
    const found = instData.find(i => i.id === sanarId);
    sanarName = found ? found.name : ourBanca;
  } else {
    const cOur = cleanStr(ourBanca);
    const found = instData.find(si => {
      const cSi = cleanStr(si.name);
      return (cSi.length > 5 && cOur.includes(cSi)) || (cOur.length > 5 && cSi.includes(cOur));
    });
    if (found) {
      sanarId = found.id;
      sanarName = found.name;
    }
  }

  if (sanarId && !seenSanarIds.has(sanarId)) {
    seenSanarIds.add(sanarId);
    matchedTargets.push({ ourBanca, count, sanarId, sanarName });
  }
}

// Sort by question count desc
matchedTargets.sort((a,b) => b.count - a.count);

console.log(`\nMatched ${matchedTargets.length} institutions representing high volume of remaining questions!`);
matchedTargets.slice(0, 20).forEach(m => console.log(`  [${m.count} remaining] ${m.ourBanca} -> ${m.sanarName} (${m.sanarId})`));

fs.writeFileSync('data/sanar_deep_targets.json', JSON.stringify(matchedTargets, null, 2), 'utf8');
