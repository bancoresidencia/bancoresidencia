import fs from 'fs';

const cat = JSON.parse(fs.readFileSync('data/medevo_all_references_catalog.json', 'utf8'));
console.log('=== METRICAS DO CATALOGO DE REFERENCIAS MEDEVO ===');
console.log('Total de referências:', cat.total_referencias);

// Por tipo
const tipos = {};
cat.referencias.forEach(r => tipos[r.tipo] = (tipos[r.tipo] || 0) + 1);
console.log('\n--- DISTRIBUIÇÃO POR TIPO DE FONTE ---');
Object.entries(tipos).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
  const pct = ((v / cat.total_referencias) * 100).toFixed(1);
  console.log(`- ${k}: ${v} (${pct}%)`);
});

// Por domínio / editora
const dominios = {};
cat.referencias.forEach(r => dominios[r.dominio || 'sem_dominio'] = (dominios[r.dominio || 'sem_dominio'] || 0) + 1);
console.log('\n--- TOP 15 DOMÍNIOS / SOCIEDADES CIENTÍFICAS ---');
Object.entries(dominios).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k,v]) => {
  const pct = ((v / cat.total_referencias) * 100).toFixed(1);
  console.log(`- ${k}: ${v} (${pct}%)`);
});

// Análise de tipos de links (PDFs vs links de páginas)
let pdfCount = 0;
let pubmedCount = 0;
let govCount = 0;
cat.referencias.forEach(r => {
  if (r.url && r.url.toLowerCase().includes('.pdf')) pdfCount++;
  if (r.url && r.url.includes('ncbi.nlm.nih.gov')) pubmedCount++;
  if (r.url && r.url.includes('gov.br')) govCount++;
});
console.log('\n--- FORMATO DOS DOCUMENTOS ---');
console.log(`- PDFs oficiais diretos: ${pdfCount} (${((pdfCount/cat.total_referencias)*100).toFixed(1)}%)`);
console.log(`- Artigos indexados (PubMed/NCBI): ${pubmedCount} (${((pubmedCount/cat.total_referencias)*100).toFixed(1)}%)`);
console.log(`- Portais governamentais (Ministério da Saúde / INCA / EBSERH): ${govCount} (${((govCount/cat.total_referencias)*100).toFixed(1)}%)`);

// Análise de entidades / órgãos citados nos títulos
const entidades = {
  'EAU (European Association of Urology)': 0,
  'FEBRASGO': 0,
  'Ministério da Saúde / MS / SUS': 0,
  'UpToDate / StatPearls / NCBI Bookshelf': 0,
  'INCA (Instituto Nacional de Câncer)': 0,
  'ACOG (American College of Obstetricians and Gynecologists)': 0,
  'Sociedades Brasileiras (SBU, SBRH, etc.)': 0,
  'OMS / WHO (World Health Organization)': 0,
  'CDC (Centers for Disease Control and Prevention)': 0,
  'MSD Manuals': 0
};

cat.referencias.forEach(r => {
  const t = (r.titulo + ' ' + (r.url || '')).toLowerCase();
  if (t.includes('uroweb') || t.includes('eau')) entidades['EAU (European Association of Urology)']++;
  if (t.includes('febrasgo')) entidades['FEBRASGO']++;
  if (t.includes('ministério da saúde') || t.includes('saude.gov.br') || t.includes('sus')) entidades['Ministério da Saúde / MS / SUS']++;
  if (t.includes('statpearls') || t.includes('bookshelf') || t.includes('uptodate')) entidades['UpToDate / StatPearls / NCBI Bookshelf']++;
  if (t.includes('inca')) entidades['INCA (Instituto Nacional de Câncer)']++;
  if (t.includes('acog')) entidades['ACOG (American College of Obstetricians and Gynecologists)']++;
  if (t.includes('sociedade brasileira') || t.includes('sbu') || t.includes('sbrh') || t.includes('portaldaurologia')) entidades['Sociedades Brasileiras (SBU, SBRH, etc.)']++;
  if (t.includes('who') || t.includes('world health organization')) entidades['OMS / WHO (World Health Organization)']++;
  if (t.includes('cdc')) entidades['CDC (Centers for Disease Control and Prevention)']++;
  if (t.includes('msdmanuals') || t.includes('manual msd')) entidades['MSD Manuals']++;
});

console.log('\n--- GRANDES ENTIDADES CIENTÍFICAS CITADAS ---');
Object.entries(entidades).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
  console.log(`- ${k}: ${v} citações`);
});

console.log('\n--- AMOSTRAS VARIADAS DE REFERÊNCIAS ---');
cat.referencias.slice(0, 8).forEach((r, i) => {
  console.log(`[${i+1}] ${r.titulo}`);
  console.log(`    Link: ${r.url}`);
  console.log(`    Tipo: ${r.tipo} | Domínio: ${r.dominio}\n`);
});

