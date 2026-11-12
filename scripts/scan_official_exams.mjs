import fs from 'fs';
import path from 'path';

const EXAMS_DIR = path.resolve('data/official_exams');

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files = files.concat(scanDir(full));
    } else {
      files.push({
        path: full,
        rel: path.relative(EXAMS_DIR, full).replace(/\\/g, '/'),
        name: e.name,
        size: fs.statSync(full).size
      });
    }
  }
  return files;
}

const allExams = scanDir(EXAMS_DIR);
console.log(`Total de arquivos em data/official_exams: ${allExams.length}`);

const extensions = {};
for (const f of allExams) {
  const ext = path.extname(f.name).toLowerCase();
  extensions[ext] = (extensions[ext] || 0) + 1;
}
console.log('Extensões:', extensions);

console.log('\nPastas principais em official_exams:');
const topFolders = fs.readdirSync(EXAMS_DIR).filter(f => fs.statSync(path.join(EXAMS_DIR, f)).isDirectory());
for (const tf of topFolders) {
  const count = allExams.filter(f => f.rel.startsWith(tf + '/')).length;
  console.log(` - ${tf}: ${count} arquivos`);
}

