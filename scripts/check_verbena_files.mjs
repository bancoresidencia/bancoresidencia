import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data/official_exams/SES_GO_2026');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function checkVerbenaFiles() {
  const base2026 = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';

  // Test various names for Clinica Medica and Cirurgia Geral
  const candidates = [
    // Provas
    { name: 'SES_GO_2026_PV_CLINICA_MEDICA_A.pdf', rel: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20CL%C3%8DNICA%20M%C3%89DICA%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_PV_CLINICA_MEDICA_A_2.pdf', rel: 'provas/R1%20COM%20PRE-REQUISITO%20EM%20CLINICA%20MEDICA%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_PV_CIRURGIA_GERAL_A.pdf', rel: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20CIRURGIA%20GERAL%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_PV_CIRURGIA_GERAL_A_2.pdf', rel: 'provas/R1%20COM%20PRE-REQUISITO%20EM%20CIRURGIA%20GERAL%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_PV_GIN_OBS_A.pdf', rel: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20GINECOLOGIA%20E%20OBSTETR%C3%8DCIA%20TIPO%20A.pdf' },

    // Gabaritos
    { name: 'SES_GO_2026_GB_CLINICA_MEDICA_A.pdf', rel: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Clinica%20Medica%20todos%20Tipo%20A.pdf' },
    { name: 'SES_GO_2026_GB_CLINICA_MEDICA_A_2.pdf', rel: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pr%C3%A9-requisito%20em%20Cl%C3%ADnica%20M%C3%A9dica%20todos%20Tipo%20A.pdf' },
    { name: 'SES_GO_2026_GB_CIRURGIA_GERAL_A.pdf', rel: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Cirurgia%20Geral%20todos%20Tipo%20A.pdf' },
    { name: 'SES_GO_2026_GB_CIRURGIA_GERAL_A_2.pdf', rel: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pr%C3%A9-requisito%20em%20Cirurgia%20Geral%20todos%20Tipo%20A.pdf' }
  ];

  for (const c of candidates) {
    const url = base2026 + c.rel;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`[${res.status}] ${c.name} <- ${c.rel}`);
      if (res.ok) {
        // download
        const getRes = await fetch(url);
        const buf = Buffer.from(await getRes.arrayBuffer());
        const dest = path.join(outDir, c.name);
        fs.writeFileSync(dest, buf);
        console.log(`  -> DOWNLOADED and saved to ${c.name} (${(buf.length/1024).toFixed(1)} KB)`);
      }
    } catch (e) {
      console.error(c.name, e.message);
    }
  }
}

checkVerbenaFiles();
