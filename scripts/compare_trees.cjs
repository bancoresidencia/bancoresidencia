const fs = require('fs');

console.log('--- Checking catalog files in docs/ ---');
const files = [
  'docs/catalogo_mestre_geral.md',
  'docs/catalogo_clinica_medica.md',
  'docs/hierarquia_completa_filtros.md',
  'docs/hierarquia_completa_filtros_recategorizada.md',
  'docs/PLANO_REESTRUTURACAO_TAXONOMICA_WORKERS_132K.md'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const hasSubSub = text.includes('sub_subfoco') || text.includes('Sub-subfoco') || text.includes('sub-subfoco') || text.includes('4º nível') || text.includes('5º nível');
    console.log(`${f}: size = ${text.length}, mentions sub-subfoco? ${hasSubSub}`);
  }
}
