import fs from 'fs';

const report = JSON.parse(fs.readFileSync('data/relatorio_pendencias_detalhado.json', 'utf8'));
const instYearMap = report.instYearMap;

const years = ['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

for (const yr of years) {
  const insts = instYearMap[yr] || {};
  const sorted = Object.entries(insts).sort((a,b) => b[1] - a[1]);
  const total = report.yearCounts[yr] || 0;
  console.log(`\n======================================================`);
  console.log(`ANO ${yr} — Total Pendente: ${total} questões`);
  console.log(`======================================================`);
  sorted.slice(0, 15).forEach(([inst, cnt], idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${inst.padEnd(52)}: ${cnt}`);
  });
  if (sorted.length > 15) {
    const others = sorted.slice(15).reduce((acc, cur) => acc + cur[1], 0);
    console.log(`  ... mais ${sorted.length - 15} outras instituições somando ${others} questões.`);
  }
}

// Histórico (<= 2019)
console.log(`\n======================================================`);
console.log(`ANOS HISTÓRICOS (2010 a 2019) — Total Pendente: ${Object.entries(report.yearCounts).filter(e => parseInt(e[0]) <= 2019).reduce((a,c) => a + c[1], 0)} questões`);
console.log(`======================================================`);
const histInsts = {};
for (const [yr, insts] of Object.entries(instYearMap)) {
  if (parseInt(yr) <= 2019) {
    for (const [inst, cnt] of Object.entries(insts)) {
      histInsts[inst] = (histInsts[inst] || 0) + cnt;
    }
  }
}
const sortedHist = Object.entries(histInsts).sort((a,b) => b[1] - a[1]);
sortedHist.slice(0, 15).forEach(([inst, cnt], idx) => {
  console.log(`  ${(idx + 1).toString().padStart(2)}. ${inst.padEnd(52)}: ${cnt}`);
});

