import xlsx from 'xlsx';

const files = [
  { name: 'gabarito_(2).xlsx', path: 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731419_39334b2d.xlsx' },
  { name: 'gabarito_(1).xlsx', path: 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731457_571dbc0d.xlsx' }
];

for (const f of files) {
  try {
    const wb = xlsx.readFile(f.path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`\n=== ${f.name} ===`);
    console.log(`Sheets: ${wb.SheetNames} | Linhas: ${rows.length}`);
    console.log('Primeira linha:', rows[0]);
  } catch (e) {
    console.error(`Erro ao ler ${f.name}:`, e.message);
  }
}
