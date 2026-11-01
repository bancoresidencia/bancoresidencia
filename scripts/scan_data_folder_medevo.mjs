import fs from 'fs';
import path from 'path';

function searchDataDir() {
  const dir = 'data';
  const files = fs.readdirSync(dir);
  console.log(`Analyzing ${files.length} items in /data...`);
  
  const results = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    if (!f.endsWith('.json') && !f.endsWith('.csv') && !f.endsWith('.md')) continue;

    const content = fs.readFileSync(full, 'utf8');
    const matches = content.match(/medevo/gi);
    if (matches && matches.length > 0) {
      results.push({
        file: f,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
        occurrences: matches.length
      });
      console.log(`📁 ${f} (${(stat.size / 1024 / 1024).toFixed(1)} MB) -> ${matches.length} occurrences of "medevo"`);
    }
  }

  console.log(`\nTotal files with "medevo" in /data: ${results.length}`);
  fs.writeFileSync('scripts/data_folder_medevo_hits.json', JSON.stringify(results, null, 2));
}

searchDataDir();
