import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { chromium } from 'playwright';

// Top alvos reais e específicos baseados no ranking ao vivo do Supabase
const TARGETS = [
  { id: 'SES_GO_2026', inst: 'SES-GO', year: 2026, query: 'site:cs.ufg.br residencia medica 2026 (prova OR caderno) gabarito filetype:pdf' },
  { id: 'SES_GO_2026_B', inst: 'SES-GO', year: 2026, query: '"SES-GO" "residencia medica" 2026 "ACESSO DIRETO" gabarito oficial filetype:pdf' },
  { id: 'HSL_DF_2025', inst: 'Hospital Sírio-Libanês Brasília', year: 2025, query: '"Sirio-Libanes" "Brasilia" "residencia medica" 2025 "caderno de questoes" OR "gabarito definitivo" filetype:pdf' },
  { id: 'HSL_DF_2024', inst: 'Hospital Sírio-Libanês Brasília', year: 2024, query: '"Sirio-Libanes" "Brasilia" "residencia medica" 2024 "caderno de questoes" OR "gabarito definitivo" filetype:pdf' },
  { id: 'SAO_CAMILO_2024', inst: 'Hospital São Camilo SP', year: 2024, query: '"Sao Camilo" "residencia medica" 2024 (prova OR caderno) gabarito definitivo filetype:pdf' },
  { id: 'SAO_CAMILO_2023', inst: 'Hospital São Camilo SP', year: 2023, query: '"Sao Camilo" "residencia medica" 2023 (prova OR caderno) gabarito definitivo filetype:pdf' },
  { id: 'MANDIC_2026', inst: 'São Leopoldo Mandic', year: 2026, query: '"São Leopoldo Mandic" "residencia medica" 2026 (prova OR caderno) gabarito oficial filetype:pdf' },
  { id: 'MANDIC_2025', inst: 'São Leopoldo Mandic', year: 2025, query: '"São Leopoldo Mandic" "residencia medica" 2025 (prova OR caderno) gabarito oficial filetype:pdf' },
  { id: 'AMERICAS_2026', inst: 'Complexo Américas', year: 2026, query: '"Complexo Américas" OR "Rede Americas" "residencia medica" 2026 "caderno de questoes" OR "gabarito" filetype:pdf' },
  { id: 'UNB_HUB_2016', inst: 'UnB/HUB', year: 2016, query: 'site:cespe.unb.br OR site:cebraspe.org.br "HUB" "residencia medica" 2016 (caderno OR prova) gabarito filetype:pdf' },
  { id: 'HOA_2026', inst: 'HOA', year: 2026, query: '"Hospital Oftalmológico do Acre" OR "HOA" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'CEPOA_2026', inst: 'CEPOA', year: 2026, query: '"CEPOA" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'IOG_2024', inst: 'IOG', year: 2024, query: '"Instituto de Olhos de Goiânia" OR "IOG" "residencia medica" 2024 (prova OR gabarito) filetype:pdf' },
  { id: 'IOG_2020', inst: 'IOG', year: 2020, query: '"Instituto de Olhos de Goiânia" OR "IOG" "residencia medica" 2020 (prova OR gabarito) filetype:pdf' },
  { id: 'FUBOG_2023', inst: 'FUBOG', year: 2023, query: '"FUBOG" OR "Banco de Olhos de Goias" "residencia medica" 2023 (prova OR gabarito) filetype:pdf' },
  { id: 'FUBOG_2022', inst: 'FUBOG', year: 2022, query: '"FUBOG" OR "Banco de Olhos de Goias" "residencia medica" 2022 (prova OR gabarito) filetype:pdf' },
  { id: 'HABM_2025', inst: 'HABM', year: 2025, query: '"Hospital Dr. Adolfo Bezerra de Menezes" OR "HABM" "residencia medica" 2025 (prova OR gabarito) filetype:pdf' },
  { id: 'HABM_2024', inst: 'HABM', year: 2024, query: '"Hospital Dr. Adolfo Bezerra de Menezes" OR "HABM" "residencia medica" 2024 (prova OR gabarito) filetype:pdf' },
  { id: 'SC_MACEIO_2026', inst: 'Santa Casa de Maceió', year: 2026, query: '"Santa Casa de Maceió" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'HMMSJP_2026', inst: 'HMMSJP', year: 2026, query: '"São José dos Pinhais" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'JAYME_NEVES_2026', inst: 'HE Jayme dos Santos Neves', year: 2026, query: '"Jayme dos Santos Neves" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'UEM_2026', inst: 'UEM', year: 2026, query: '"Universidade Estadual de Maringá" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'USCS_2026', inst: 'USCS', year: 2026, query: '"São Caetano do Sul" "USCS" "residencia medica" 2026 (prova OR gabarito) filetype:pdf' },
  { id: 'SELECTING_CONCURSOS', inst: 'Selecting Concursos', year: 2024, query: 'site:concursos.selecting.com.br "residencia medica" (prova OR caderno OR gabarito) filetype:pdf' }
];

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124' }, timeout: 20000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function decodeBingUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.includes('u=a1')) {
    try {
      const b64 = rawUrl.split('u=a1')[1].split('&')[0];
      const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
      const dec = Buffer.from(padded, 'base64').toString('utf8');
      if (dec.startsWith('http')) return dec;
    } catch (e) {}
  }
  return rawUrl.startsWith('http') ? rawUrl : null;
}

export async function runAutoPdfHunter() {
  console.log('========================================================================');
  console.log('🎯 CAÇADOR AUTOMÁTICO DE PDFS OFICIAIS (BACKGROUND DAEMON)');
  console.log('   Alvo: Busca direcionada para as top instituições e anos específicos');
  console.log('   Fluxo: Download em incoming_exams -> Parser em segundo plano -> Supabase');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  for (const t of TARGETS) {
    console.log(`\n🔎 [CAÇADOR] Buscando PDFs oficiais para: ${t.inst} (${t.year})...`);
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(t.query)}`;

    let pdfLinks = [];
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);

      const rawLinks = await page.evaluate(() => {
        const found = [];
        document.querySelectorAll('a').forEach(a => {
          if (a.href) found.push(a.href);
        });
        return found;
      });

      for (const r of rawLinks) {
        let dec = decodeBingUrl(r) || r;
        if (dec && dec.startsWith('http') && !dec.includes('bing.com')) {
          const lower = dec.toLowerCase();
          if (lower.includes('.pdf') || lower.includes('arquivo.php') || lower.includes('download')) {
            if (!pdfLinks.includes(dec)) pdfLinks.push(dec);
          }
        }
      }
    } catch (e) {
      console.warn(`   ⚠️ Erro ao buscar links para ${t.id}:`, e.message);
    }

    console.log(`   📄 Links de PDF encontrados: ${pdfLinks.length}`);

    const targetDir = path.resolve('data/incoming_exams', t.id);
    let downloadedAny = false;

    for (const pUrl of pdfLinks.slice(0, 5)) {
      try {
        const urlLower = pUrl.toLowerCase();
        let fileName = path.basename(new URL(pUrl).pathname);
        if (!fileName.endsWith('.pdf')) fileName += '.pdf';

        // Identifica se é Prova ou Gabarito
        if (urlLower.includes('gabarito') || urlLower.includes('gb_') || urlLower.includes('resultado') || urlLower.includes('definitivo')) {
          fileName = `GB_${t.id}_${fileName}`;
        } else {
          fileName = `PV_${t.id}_${fileName}`;
        }

        fs.mkdirSync(targetDir, { recursive: true });
        const dest = path.join(targetDir, fileName);

        if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
          console.log(`   ⬇️  Baixando: ${fileName}...`);
          await downloadFile(pUrl, dest);
          const size = fs.statSync(dest).size;
          if (size > 10000) {
            console.log(`   ✅ Download concluído: ${fileName} (${(size/1024).toFixed(1)} KB)`);
            downloadedAny = true;
          } else {
            try { fs.unlinkSync(dest); } catch (e) {}
          }
        }
      } catch (e) {
        // Erro no download individual
      }
    }

    // Intervalo de segurança entre buscas
    await new Promise(r => setTimeout(r, 4000));
  }

  await browser.close();
  console.log('\n🏁 Ciclo do Caçador concluído. Aguardando 180s para nova varredura de checagem...');
  setTimeout(runAutoPdfHunter, 180000);
}

runAutoPdfHunter().catch(err => {
  console.error('❌ Erro fatal no caçador de PDFs:', err);
  setTimeout(runAutoPdfHunter, 60000);
});
