import fs from 'fs';

const exams = [];
const lines = fs.readFileSync('data/relatorio_provas_instituicoes_ano.csv', 'utf8').trim().split('\n').slice(1);

for (const line of lines) {
  // RFC 4180 parsing
  const row = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  row.push(current);

  exams.push({
    inst: row[0],
    banca: row[1],
    ano: Number(row[2]),
    tipo: row[3],
    total: Number(row[4]),
    com_gabarito: Number(row[5]),
    anuladas: Number(row[6]),
    discursivas: Number(row[7]),
    auditadas: Number(row[8]),
    faltam: Number(row[9]),
    pct: row[10]
  });
}

// Year breakdown
const byYear = {};
for (const e of exams) {
  if (!byYear[e.ano]) byYear[e.ano] = { exams: 0, total: 0, auditadas: 0, com_gab: 0, anuladas: 0, faltam: 0 };
  byYear[e.ano].exams++;
  byYear[e.ano].total += e.total;
  byYear[e.ano].auditadas += e.auditadas;
  byYear[e.ano].com_gab += e.com_gabarito;
  byYear[e.ano].anuladas += e.anuladas;
  byYear[e.ano].faltam += e.faltam;
}

console.log('--- BY YEAR ---');
const sortedYears = Object.keys(byYear).map(Number).sort((a,b) => b - a);
for (const y of sortedYears) {
  const item = byYear[y];
  const pct = ((item.auditadas / item.total) * 100).toFixed(1);
  console.log(`${y} | ${item.exams} provas | ${item.total} q | ${item.com_gab} gab | ${item.anuladas} anul | ${item.faltam} faltam | ${pct}%`);
}

// Missing distribution
const missDist = { '0 (100% blindada)': 0, '1': 0, '2': 0, '3 a 5': 0, '6 a 10': 0, '11 a 20': 0, '> 20': 0 };
const missQDist = { '1': 0, '2': 0, '3 a 5': 0, '6 a 10': 0 };
for (const e of exams) {
  if (e.faltam === 0) missDist['0 (100% blindada)']++;
  else if (e.faltam === 1) { missDist['1']++; missQDist['1'] += 1; }
  else if (e.faltam === 2) { missDist['2']++; missQDist['2'] += 2; }
  else if (e.faltam <= 5) { missDist['3 a 5']++; missQDist['3 a 5'] += e.faltam; }
  else if (e.faltam <= 10) { missDist['6 a 10']++; missQDist['6 a 10'] += e.faltam; }
  else if (e.faltam <= 20) missDist['11 a 20']++;
  else missDist['> 20']++;
}
console.log('--- MISSING BUCKETS ---', JSON.stringify(missDist, null, 2));
console.log('--- MISSING Q IN BUCKETS ---', JSON.stringify(missQDist, null, 2));

// Top blindadas by size
const topBlindadas = exams.filter(e => e.faltam === 0).sort((a,b) => b.total - a.total).slice(0, 15);
console.log('--- TOP BLINDADAS ---');
topBlindadas.forEach(e => console.log(`${e.inst} (${e.ano}) - ${e.total}q - 100%`));

// Top gargalos
const topGargalos = exams.slice().sort((a,b) => b.faltam - a.faltam).slice(0, 15);
console.log('--- TOP GARGALOS ---');
topGargalos.forEach(e => console.log(`${e.inst} (${e.ano}) - faltam ${e.faltam} de ${e.total} (${e.pct})`));
