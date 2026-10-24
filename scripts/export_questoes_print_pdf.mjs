import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const questionIds = [
  'dfd55754-daee-41dc-8fdb-181302bd7e41', // SEMUSA Macaé 2026 - 48 anos, FSH 87,57
  'e7c44cd3-ec6e-48dc-abc0-1f8e93661d59', // UNITPAC 2026 - 42 anos, endométrio 14mm
  'e437f30f-7ddb-441a-9d8d-7a6c2835b7b7', // FAMENE 2026 - O SUA pode ser causado por
  '811f1dc1-f687-4e68-b251-034b58dafbad', // AFAMCI 2026 - Padrão-ouro intracavitária
  '7398283e-a6f5-459d-9184-3cb3b4c01c3d', // IPSEMG 2026 - PALM-COEIN V/F
  '3f87f2fc-8b24-42e5-8e58-2a3b71786f39', // SES-DF 2026 - 25 anos, hipótese diagnóstica
  'fcd24f17-edb8-40b1-aba4-28c210bdd657', // SES-DF 2026 - 25 anos, fisiopatologia
  '9700c760-3c89-4fb0-864e-374875b919b2', // HUSE 2026 - 36 anos, enxaqueca com aura
  '6373670d-4c6c-4152-abbe-c49b52cd9db9', // HEDA 2026 - Antônia 44 anos, DIU progesterona
  '9d26d8ec-c7ab-4679-b07f-2a0dbea6a4c5', // CEPOA 2026 - 43 anos, hipotensa
  '0f6da5f9-77e9-4f0b-9549-f0a399e9fb32'  // UniAtenas 2025 - 29 anos, 2G2PC (com imagem)
];

async function generatePdf() {
  console.log('1. Buscando questões no Supabase...');
  const { data: rawQuestions, error } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, especialidade, tema, statement, options, correct_answer, images')
    .in('id', questionIds);

  if (error) {
    console.error('Erro ao consultar Supabase:', error);
    process.exit(1);
  }

  // Ordenar conforme a lista questionIds original
  const questionsMap = new Map(rawQuestions.map(q => [q.id, q]));
  const questions = questionIds.map(id => questionsMap.get(id)).filter(Boolean);

  console.log(`Carregadas ${questions.length} questões com sucesso!`);

  // Carregar imagem local da UniAtenas em Base64
  let base64Image = '';
  const imgPath = path.join(process.cwd(), 'public/images/questoes/ginecologia/mulher-29-anos-de-idade-2g2pc-comparece-ao-servico-de-gineco-01.webp');
  if (fs.existsSync(imgPath)) {
    const imgBuf = fs.readFileSync(imgPath);
    base64Image = `data:image/webp;base64,${imgBuf.toString('base64')}`;
  }

  // Montar HTML estilizado
  let questionsHtml = '';
  questions.forEach((q, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const inst = q.institution || q.banca || 'Banca Oficial';
    const ano = q.year || '2026';
    const gabaritoPlataforma = q.correct_answer || 'N/D';

    // Imagem se houver
    let imgTag = '';
    if (q.id === '0f6da5f9-77e9-4f0b-9549-f0a399e9fb32' && base64Image) {
      imgTag = `
        <div class="question-image-box">
          <img src="${base64Image}" alt="Ultrassonografia Transvaginal" class="question-image" />
          <span class="image-caption">Figura: Ultrassonografia pélvica transvaginal (corte sagital uterino)</span>
        </div>
      `;
    }

    // Alternativas
    const optionsHtml = (q.options || []).map(opt => {
      const isGabarito = (opt.letter || '').toUpperCase() === gabaritoPlataforma.toUpperCase();
      return `
        <div class="option-row ${isGabarito ? 'option-gabarito' : ''}">
          <span class="option-letter ${isGabarito ? 'letter-gabarito' : ''}">${opt.letter}</span>
          <span class="option-text">${opt.text}</span>
          ${isGabarito ? '<span class="badge-correta">✓ Gabarito da Plataforma</span>' : ''}
        </div>
      `;
    }).join('');

    questionsHtml += `
      <article class="question-card">
        <header class="question-header">
          <div class="header-left">
            <span class="question-number">QUESTÃO ${num}</span>
            <span class="institution-badge">${inst} • ${ano}</span>
          </div>
          <div class="header-right">
            <span class="gabarito-tag">Gabarito: <strong>${gabaritoPlataforma}</strong></span>
          </div>
        </header>

        <div class="statement-body">
          ${q.statement.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}
        </div>

        ${imgTag}

        <div class="options-container">
          ${optionsHtml}
        </div>

        <footer class="question-footer">
          <div class="gabarito-banner">
            <span class="gabarito-label">GABARITO APONTADO NA PLATAFORMA:</span>
            <span class="gabarito-choice">ALTERNATIVA ${gabaritoPlataforma}</span>
          </div>
        </footer>
      </article>
    `;
  });

  const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Caderno de Questões — Ginecologia & Sangramento Uterino Anormal</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm 16mm 14mm;
      @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-left {
        content: "Banco Residência — Caderno de Exportação Oficial";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 9pt;
      line-height: 1.5;
    }

    /* CAPA / CABEÇALHO DO DOCUMENTO */
    .doc-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .brand-title span {
      color: #2563eb;
    }

    .doc-subtitle {
      font-size: 9.5pt;
      color: #475569;
      font-weight: 500;
      margin-top: 2px;
    }

    .meta-box {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
    }

    .meta-box strong {
      color: #0f172a;
    }

    /* CARD DA QUESTÃO */
    .question-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .question-number {
      font-size: 8.5pt;
      font-weight: 800;
      background: #0f172a;
      color: #ffffff;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .institution-badge {
      font-size: 8.5pt;
      font-weight: 700;
      color: #1e293b;
    }

    .gabarito-tag {
      font-size: 8pt;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .gabarito-tag strong {
      color: #2563eb;
      font-size: 8.5pt;
    }

    /* CORPO DO ENUNCIADO */
    .statement-body {
      font-size: 9pt;
      color: #1e293b;
      line-height: 1.48;
      text-align: justify;
      margin-bottom: 12px;
    }

    /* IMAGEM */
    .question-image-box {
      text-align: center;
      margin: 10px 0 14px 0;
      padding: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    .question-image {
      max-height: 160px;
      max-width: 100%;
      border-radius: 4px;
      object-fit: contain;
    }

    .image-caption {
      display: block;
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }

    /* OPÇÕES */
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .option-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 5px;
      background: #fafafa;
      border: 1px solid #f1f5f9;
      font-size: 8.5pt;
    }

    .option-gabarito {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    .option-letter {
      font-weight: 700;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
      font-size: 8pt;
      flex-shrink: 0;
    }

    .letter-gabarito {
      background: #2563eb;
      color: #ffffff;
    }

    .option-text {
      flex: 1;
      color: #1e293b;
      line-height: 1.35;
    }

    .badge-correta {
      font-size: 7pt;
      font-weight: 700;
      color: #1d4ed8;
      background: #dbeafe;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* FOOTER DO CARD */
    .question-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
      margin-top: 4px;
    }

    .gabarito-banner {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      font-size: 8pt;
    }

    .gabarito-label {
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.02em;
    }

    .gabarito-choice {
      font-weight: 800;
      color: #2563eb;
      background: #dbeafe;
      padding: 2px 8px;
      border-radius: 4px;
    }
  </style>
</head>
<body>

  <header class="doc-header">
    <div>
      <h1 class="brand-title">Banco<span>Residência</span></h1>
      <p class="doc-subtitle">Caderno de Questões Auditadas — Ginecologia & Sangramento Uterino Anormal</p>
    </div>
    <div class="meta-box">
      <p>Total de Questões: <strong>${questions.length}</strong></p>
      <p>Data de Emissão: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
      <p>Versão de Exportação Oficial</p>
    </div>
  </header>

  <main>
    ${questionsHtml}
  </main>

</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), 'scratch', 'questoes_export.html');
  if (!fs.existsSync(path.join(process.cwd(), 'scratch'))) {
    fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });
  }
  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log('2. HTML gerado com sucesso em scratch/questoes_export.html');

  // Gerar PDF via Playwright
  console.log('3. Inicializando Playwright Chromium para compilar o PDF...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'load' });

  const pdfOutputDocs = path.join(process.cwd(), 'docs', 'caderno_questoes_ginecologia_revisao.pdf');
  const pdfOutputPublic = path.join(process.cwd(), 'public', 'caderno_questoes_ginecologia_revisao.pdf');

  if (!fs.existsSync(path.dirname(pdfOutputDocs))) {
    fs.mkdirSync(path.dirname(pdfOutputDocs), { recursive: true });
  }

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      right: '12mm',
      bottom: '16mm',
      left: '12mm'
    }
  });

  fs.writeFileSync(pdfOutputDocs, pdfBuffer);
  fs.writeFileSync(pdfOutputPublic, pdfBuffer);

  await browser.close();

  console.log(`\n🎉 PDF GERADO COM SUCESSO!`);
  console.log(`📂 Arquivo 1: ${pdfOutputDocs} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`📂 Arquivo 2: ${pdfOutputPublic}`);
}

generatePdf();
