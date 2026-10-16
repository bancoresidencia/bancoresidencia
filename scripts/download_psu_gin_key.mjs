import https from 'https';
import fs from 'fs';

const url = 'https://www.galaxcms.com.br/up_crud_comum/601/GABARITOPRELIMINARGINECOLOGIAEOBSTETRICIATIPO1-PSUMG2025-20241201170321.pdf';
const outPath = 'data/official_exams/PSU_MG/PSU_MG_2025_GABARITO_PRELIMINAR_GINECOLOGIA_TIPO1.pdf';

const file = fs.createWriteStream(outPath);
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded:', outPath, 'bytes:', fs.statSync(outPath).size);
  });
}).on('error', err => console.error(err));
