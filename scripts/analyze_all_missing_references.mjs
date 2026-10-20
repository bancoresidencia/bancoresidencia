import fs from 'fs';
import path from 'path';

const SOURCE_FILE = path.join(process.cwd(), 'data', 'knowledge', 'referencias_materiais_apoio', 'todas_referencias_unificadas.json');
const DOCS_DIR = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais', 'markdown_docs');

function isBookReference(r) {
  if (r.tipo === 'livro_texto') return true;
  const str = ((r.titulo || '') + ' ' + (r.texto_referencia || '')).toLowerCase();
  const bookKeywords = [
    'tratado de', 'campbell-walsh', 'harrison', 'sabiston',
    'nelson tratado', 'williams obstetric', 'cecil medicina',
    'guyton', 'current medical diagnosis', 'manual de farmacologia',
    'atls: advanced trauma', 'robbins patologia', 'goldman-cecil',
    'barash clinical anesthesia', 'berek & novak', 'schwartz principios'
  ];
  return bookKeywords.some(kw => str.includes(kw));
}

const allRefs = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8')).referencias || [];
const targetRefs = allRefs.filter(r => !isBookReference(r) && r.url);
const savedFiles = new Set(fs.readdirSync(DOCS_DIR).map(f => f.replace(/\.md$/i, '')));

const missing = targetRefs.filter(r => {
  const safeId = r.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return !savedFiles.has(safeId);
});

console.log('Total de alvos oficiais:', targetRefs.length);
console.log('Total já salvos em markdown:', savedFiles.size);
console.log('Total de pendências reais:', missing.length);

const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/;

const categorized = {
  groupC_doi: [],
  groupA_cloudflare: [],
  groupB_broken_or_other: []
};

const cloudflareDomains = [
  'cpr.heart.org', 'professional.heart.org', 'ahajournals.org',
  'acog.org', 'auajournals.org', 'east.org', 'publications.aap.org'
];

missing.forEach(r => {
  const textToScan = `${r.url || ''} ${r.texto_referencia || ''} ${r.titulo || ''}`;
  const doiMatch = textToScan.match(doiRegex);

  let hostname = '';
  try {
    hostname = new URL(r.url).hostname.replace(/^www\./, '');
  } catch {}

  if (doiMatch) {
    let doi = doiMatch[0].replace(/[.,;)]+$/, '');
    categorized.groupC_doi.push({ ...r, doi, hostname });
  } else if (cloudflareDomains.some(d => hostname.includes(d))) {
    categorized.groupA_cloudflare.push({ ...r, hostname });
  } else {
    categorized.groupB_broken_or_other.push({ ...r, hostname });
  }
});

console.log('\n--- Classificação das Pendências ---');
console.log(`Grupo C (DOIs para Sci-Hub): ${categorized.groupC_doi.length}`);
console.log(`Grupo A (Anti-Bot / Cloudflare para Navegador Real): ${categorized.groupA_cloudflare.length}`);
console.log(`Grupo B (Links quebrados / mudados para Busca e Wayback): ${categorized.groupB_broken_or_other.length}`);

const OUT_PATH = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais', 'pendencias_categorizadas.json');
fs.writeFileSync(OUT_PATH, JSON.stringify(categorized, null, 2), 'utf8');
console.log(`\nSalvo em: ${OUT_PATH}`);
