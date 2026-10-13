import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function check(name, filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buf });
    await parser.load();
    const res = await parser.getText();
    const str = typeof res === 'string' ? res : (res?.text || '');
    console.log(`\n--- ${name} (len: ${str.length}) ---`);
    console.log(str.slice(0, 500));
  } catch (e) {
    console.error(`Error on ${name}:`, e.message);
  }
}

async function main() {
  await check('INEP 2011 GB', './data/official_exams/INEP_REVALIDA/INEP_2011_GB.pdf');
  await check('INEP 2013 GB', './data/official_exams/INEP_REVALIDA/INEP_2013_GB.pdf');
  await check('INEP 2017 GB', './data/official_exams/INEP_REVALIDA/INEP_2017_GB_1.pdf');
  await check('ENARE 2020 PV', './data/official_exams/ENARE/ENARE_2020_PV_AD.pdf');
  await check('ENARE 2022 PV', './data/official_exams/ENARE/ENARE_2022_PV_AD.pdf');
  await check('ENARE 2023 PV', './data/official_exams/ENARE/ENARE_2023_PV_AD.pdf');
  await check('ENARE 2022 GB', './data/official_exams/ENARE/ENARE_2022_GB_DEF.pdf');
}

main();
