import fs from 'fs';

const testFiles = [
  '13702fdf_revalida_2021_rm_massa_abdominal_neuroblastoma.webp',
  'durante-colecistectomia-pos-pancreatite-aguda-leve-foi-optad-01.webp',
  '9d1dd979_fundoplicatura_nissen_2022.webp',
  'mulher-48-anos-previamente-higida-apresenta-dor-abdominal-va-01.webp',
  'heda-2026-q017-01.webp'
];

for (const tf of testFiles) {
  const p1 = `data/imagens_banco_geral/${tf}`;
  const p2 = `data/imagens_medevo_download/${tf}`;
  console.log(`${tf}: banco_geral=${fs.existsSync(p1)}, medevo=${fs.existsSync(p2)}`);
}
