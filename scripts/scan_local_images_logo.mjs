import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const REF_LOGO_PATH = 'scripts/medevo_logo_ref.png';
const IMAGES_DIR = 'public/images';
const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;

function getAllFiles(dir, exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllFiles(full, exts));
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (exts.includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

// Cor do Mascote MedEvo:
// Cérebro Azul: R ~ 50..120, G ~ 140..210, B ~ 220..255 (B > R + 40 e G > R + 20)
// Cruz Laranja: R ~ 220..255, G ~ 100..160, B ~ 0..60 (R > 180, B < 80, G entre 80 e 170)
async function analyzeImageColors(filePath) {
  try {
    const { data, info } = await sharp(filePath)
      .resize(200, 200, { fit: 'inside' }) // resize para análise ultra-rápida
      .raw()
      .toBuffer({ resolveWithObject: true });

    let bluePixels = 0;
    let orangePixels = 0;
    const channels = info.channels;
    const totalPixels = info.width * info.height;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = channels === 4 ? data[i+3] : 255;
      if (a < 30) continue; // ignora fundo transparente

      // Azul característico do mascote
      if (b > 130 && b > r + 30 && g > 70) {
        bluePixels++;
      }
      // Laranja característico da cruz
      if (r > 160 && g > 60 && g < 180 && b < 80) {
        orangePixels++;
      }
    }

    const bluePct = bluePixels / totalPixels;
    const orangePct = orangePixels / totalPixels;

    // Se tiver presença dos dois ou se o nome do arquivo for suspeito
    const hasBothColors = (bluePixels >= 5 && orangePixels >= 3);
    return {
      filePath,
      totalPixels,
      bluePixels,
      orangePixels,
      bluePct,
      orangePct,
      isSuspicious: hasBothColors
    };
  } catch (err) {
    return { filePath, error: err.message, isSuspicious: false };
  }
}

async function verifyWithGemini(filePath, refBase64) {
  try {
    const targetBuffer = await sharp(filePath).resize(600, 600, { fit: 'inside' }).png().toBuffer();
    const targetBase64 = targetBuffer.toString('base64');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`;
    const prompt = `Você é um auditor de imagens médicas. 
A imagem 1 de referência contém o logotipo/mascote do "MedEvo" (um cérebro azul cartoon sorridente com uma cruz laranja no topo).
Examine a imagem 2 com atenção extrema (inclusive cantos, rodapés, cabeçalhos, marcas d'água semitransparentes no fundo ou ilustrações).
O mascote ou símbolo da imagem 1 está presente nesta imagem 2?
Responda EXCLUSIVAMENTE em formato JSON puro:
{
  "has_symbol": true ou false,
  "confidence": número de 0 a 100,
  "details": "descrição curta de onde está ou por que não está"
}`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: refBase64 } },
          { inlineData: { mimeType: 'image/png', data: targetBase64 } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText);
    }
    return { has_symbol: false, confidence: 0, details: 'Sem resposta' };
  } catch (e) {
    return { has_symbol: false, confidence: 0, error: e.message };
  }
}

async function main() {
  console.log('=== AUDITORIA DE IMAGENS LOCAIS (public/images) ===');
  const files = getAllFiles(IMAGES_DIR);
  console.log(`Total de arquivos encontrados em ${IMAGES_DIR}: ${files.length}`);

  const refBuffer = fs.readFileSync(REF_LOGO_PATH);
  const refBase64 = refBuffer.toString('base64');

  const filenameHits = files.filter(f => /medevo|evo/i.test(path.basename(f)));
  console.log(`Arquivos com "medevo" ou "evo" no nome: ${filenameHits.length}`);
  filenameHits.forEach(f => console.log(' ->', f));

  console.log('\nAnalisando perfis cromáticos dos 986 arquivos...');
  const suspicious = [];
  let count = 0;
  for (const f of files) {
    count++;
    if (count % 200 === 0) console.log(`Analisados ${count}/${files.length}...`);
    const res = await analyzeImageColors(f);
    if (res.isSuspicious) {
      suspicious.push(res);
      console.log(`⚠️ Imagem suspeita (azul + laranja): ${path.basename(f)} (Azul: ${res.bluePixels}, Laranja: ${res.orangePixels})`);
    }
  }

  console.log(`\nTotal de imagens locais suspeitas por cor: ${suspicious.length}`);

  const confirmedHits = [];
  for (const s of suspicious) {
    console.log(`Verificando com IA: ${s.filePath}...`);
    const aiRes = await verifyWithGemini(s.filePath, refBase64);
    console.log(`Resultado IA:`, aiRes);
    if (aiRes.has_symbol && aiRes.confidence >= 50) {
      confirmedHits.push({
        filePath: s.filePath,
        aiRes
      });
    }
  }

  console.log('\n===========================================');
  console.log(`CONFIRMAÇÃO LOCAL: ${confirmedHits.length} imagens com o símbolo detectado!`);
  fs.writeFileSync('scripts/local_images_logo_hits.json', JSON.stringify({ filenameHits, suspicious, confirmedHits }, null, 2));
}

main().catch(console.error);
