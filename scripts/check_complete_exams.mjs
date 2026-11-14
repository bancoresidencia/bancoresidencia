import fs from 'fs';
import path from 'path';

const baseDir = 'data/official_exams';
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

console.log('=== VERIFICAÇÃO DE EXAMES COMPLETOS EM data/official_exams ===\n');

for (const folder of folders) {
  const dirPath = path.join(baseDir, folder);
  const files = fs.readdirSync(dirPath);
  
  const cadernos = files.filter(f => /caderno|prova|_pv/i.test(f) && f.endsWith('.pdf'));
  const gabaritos = files.filter(f => /gabarito|_gb/i.test(f) && f.endsWith('.pdf'));
  
  console.log(`[${folder}] Total arquivos: ${files.length} | Cadernos (PV): ${cadernos.length} | Gabaritos (GB): ${gabaritos.length}`);
  if (cadernos.length > 0 && gabaritos.length > 0) {
    console.log(`  -> Cadernos:`, cadernos.slice(0, 3));
    console.log(`  -> Gabaritos:`, gabaritos.slice(0, 3));
  }
}
