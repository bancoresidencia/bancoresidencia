import fs from 'fs';

if (fs.existsSync('src/data/hierarquiaCompletaFiltros.json')) {
  const data = JSON.parse(fs.readFileSync('src/data/hierarquiaCompletaFiltros.json', 'utf8'));
  console.log('src/data/hierarquiaCompletaFiltros.json keys:', Object.keys(data).slice(0, 10));
} else {
  console.log('src/data/hierarquiaCompletaFiltros.json does not exist');
}
