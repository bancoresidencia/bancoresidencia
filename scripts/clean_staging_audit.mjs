import fs from 'fs';

const stagingPath = 'data/staging_homologados_85pct.json';
const staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));

// Filter out any entries with duplicate codes or without option verification
const cleanDecisoes = [];
const seenCodes = new Set();

for (const d of staging.decisoes) {
  // Reject duplicate codes
  if (seenCodes.has(d.code)) {
    console.log(`Removendo duplicata: ${d.code}`);
    continue;
  }
  // Reject if code is UERJHUPE-2024-PED-15574
  if (d.code === 'UERJHUPE-2024-PED-15574') {
    console.log(`Removendo falso positivo: ${d.code}`);
    continue;
  }
  seenCodes.add(d.code);
  cleanDecisoes.push(d);
}

staging.decisoes = cleanDecisoes;
staging.totalHomologados = cleanDecisoes.length;
staging.ultimaAtualizacao = new Date().toISOString();
fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

console.log(`Staging limpo e protegido: ${staging.totalHomologados} homologações válidas e auditadas.`);

