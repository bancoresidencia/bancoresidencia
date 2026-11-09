import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const EXAMS_DATA_PATH = path.resolve('src/data/officialExamsData.json');
const DEST_DIR = path.resolve('public/images/institutions');

// Headers que reproduzem fielmente o Google Chrome no Windows 11
const STUDENT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'Priority': 'u=1, i'
};

function humanDelay(minMs = 2000, maxMs = 6000) {
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fisher-Yates Shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function run() {
  console.log('====================================================');
  console.log('   FASE 1: MIGRAÇÃO DOS LOGOS DE INSTITUIÇÕES');
  console.log('====================================================');

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const examsData = JSON.parse(fs.readFileSync(EXAMS_DATA_PATH, 'utf8'));
  const uniqueSlugs = new Set();
  (examsData.institutions || []).forEach(inst => {
    if (inst.logoSlug && typeof inst.logoSlug === 'string') {
      uniqueSlugs.add(inst.logoSlug.trim());
    }
  });

  const allSlugs = Array.from(uniqueSlugs);
  console.log(`📋 Total de instituições únicas mapeadas: ${allSlugs.length}`);

  // Filtra o que já foi baixado para suporte a retomada
  const pendingSlugs = allSlugs.filter(slug => {
    const filePath = path.join(DEST_DIR, `${slug}.webp`);
    return !fs.existsSync(filePath) || fs.statSync(filePath).size === 0;
  });

  console.log(`📦 Já existentes: ${allSlugs.length - pendingSlugs.length}`);
  console.log(`⏳ A baixar: ${pendingSlugs.length}`);

  if (pendingSlugs.length === 0) {
    console.log('✅ Todos os logos já estão baixados e higienizados!');
    return;
  }

  // Embaralha a lista para ordem humana não-alfabética
  const shuffledSlugs = shuffle(pendingSlugs);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < shuffledSlugs.length; i++) {
    const slug = shuffledSlugs[i];
    const url = `https://www.medevo.com.br/assets/pulso/institutions/${slug}-192.webp`;
    const destPath = path.join(DEST_DIR, `${slug}.webp`);

    try {
      const waitTime = Math.floor(2000 + Math.random() * 4000);
      console.log(`[${i + 1}/${shuffledSlugs.length}] Baixando '${slug}' (espera ${waitTime}ms)...`);
      await new Promise(r => setTimeout(r, waitTime));

      const res = await fetch(url, { headers: STUDENT_HEADERS });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const rawBuffer = Buffer.from(await res.arrayBuffer());

      // Higieniza com Sharp: remove EXIF, normaliza WebP
      const cleanBuffer = await sharp(rawBuffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      fs.writeFileSync(destPath, cleanBuffer);
      successCount++;
      console.log(`   ✨ Sucesso: ${slug}.webp (${(cleanBuffer.length / 1024).toFixed(1)} KB)`);

      // Pausa de descanso a cada 30 logos baixados
      if ((i + 1) % 30 === 0 && i + 1 < shuffledSlugs.length) {
        const restSeconds = Math.floor(15 + Math.random() * 10);
        console.log(`\n☕ [Pausa de Descanso do Estudante] Aguardando ${restSeconds}s antes do próximo bloco...\n`);
        await new Promise(r => setTimeout(r, restSeconds * 1000));
      }

    } catch (err) {
      console.error(`   ❌ Falha em '${slug}': ${err.message}`);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log('   FASE 1 CONCLUÍDA');
  console.log(`   Sucessos: ${successCount}`);
  console.log(`   Falhas: ${failCount}`);
  console.log(`   Total na pasta: ${fs.readdirSync(DEST_DIR).length}`);
  console.log('====================================================\n');
}

run().catch(console.error);

