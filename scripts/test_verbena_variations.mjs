import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data/official_exams/SES_GO_2026');

async function testGabaritoVariations() {
  const base = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/gabaritos_finais/';
  const provaBase = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/provas/';

  const terms = [
    'Clinica Medica',
    'Clínica Médica',
    'Clinica Médica',
    'Clínica Medica',
    'Cirurgia Geral',
    'Cirurgia Basica',
    'Área de Cirurgia Básica',
    'Ginecologia e Obstetricia',
    'Ginecologia e Obstetrícia'
  ];

  console.log('Testing Gabaritos:');
  for (const t of terms) {
    const enc = encodeURIComponent(`Gabarito Final - R1 com pre-requisito em ${t} todos Tipo A.pdf`);
    const enc2 = encodeURIComponent(`Gabarito Final - R1 com pré-requisito em ${t} todos Tipo A.pdf`);
    const enc3 = encodeURIComponent(`Gabarito Final - ${t} Tipo A.pdf`);
    const enc4 = encodeURIComponent(`Gabarito Final - ${t}.pdf`);

    for (const file of [enc, enc2, enc3, enc4]) {
      const url = base + file;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          console.log(`FOUND GABARITO: ${decodeURIComponent(file)}`);
          const getRes = await fetch(url);
          const buf = Buffer.from(await getRes.arrayBuffer());
          fs.writeFileSync(path.join(outDir, decodeURIComponent(file).replace(/[/\\?%*:|"<>]/g, '_')), buf);
        }
      } catch (e) {}
    }
  }

  console.log('Testing Provas Cirurgia:');
  const cirTerms = [
    'CIRURGIA GERAL',
    'CIRURGIA BÁSICA',
    'CIRURGIA BASICA',
    'ÁREA DE CIRURGIA BÁSICA',
    'AREA DE CIRURGIA BASICA'
  ];
  for (const ct of cirTerms) {
    const encA = encodeURIComponent(`R1 COM PRÉ-REQUISITO EM ${ct} TIPO A.pdf`);
    const encB = encodeURIComponent(`R1 COM PRE-REQUISITO EM ${ct} TIPO A.pdf`);
    for (const f of [encA, encB]) {
      const url = provaBase + f;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          console.log(`FOUND PROVA CIRURGIA: ${decodeURIComponent(f)}`);
          const getRes = await fetch(url);
          const buf = Buffer.from(await getRes.arrayBuffer());
          fs.writeFileSync(path.join(outDir, decodeURIComponent(f).replace(/[/\\?%*:|"<>]/g, '_')), buf);
        }
      } catch (e) {}
    }
  }
}

testGabaritoVariations();
