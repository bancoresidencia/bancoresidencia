import fs from 'fs';

const list = JSON.parse(fs.readFileSync('data/remaining_watermarked_1769.json', 'utf8'));
const uspSp2026 = list.filter(q => q.institution === 'USP-SP' && q.year === 2026);

console.log(`USP-SP 2026 watermarked questions count: ${uspSp2026.length}`);
console.log('Sample statements:');
uspSp2026.slice(0, 10).forEach((q, i) => {
  console.log(`\n[${i + 1}] ID: ${q.id}`);
  console.log(`Stmt: ${q.statement.substring(0, 140).replace(/\n/g, ' ')}...`);
  console.log(`Images: ${JSON.stringify(q.images)}`);
});

fs.writeFileSync('data/usp_sp_2026_watermarked.json', JSON.stringify(uspSp2026, null, 2), 'utf8');
