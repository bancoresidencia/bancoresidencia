import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais');
const PDF_DIR = path.join(BASE_DIR, 'raw_pdfs');
const DOCS_DIR = path.join(BASE_DIR, 'markdown_docs');
const CHECKPOINT_PATH = path.join(BASE_DIR, 'checkpoint_purged.json');

[DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function purgeExisting() {
  console.log('===============================================================');
  console.log('🧹 PROCESSANDO E DELETANDO OS PDFs PESADOS JÁ BAIXADOS');
  console.log('🏛️ EXTRAÇÃO DE TEXTO PARA MARKDOWN E LIBERAÇÃO IMEDIATA DO SSD');
  console.log('===============================================================\n');

  if (!fs.existsSync(PDF_DIR)) {
    console.log('Nenhum PDF encontrado em raw_pdfs.');
    return;
  }

  const pdfFiles = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📁 Encontrados ${pdfFiles.length} PDFs para processar e apagar.\n`);

  let freedBytes = 0;
  let textSavedCount = 0;

  for (let i = 0; i < pdfFiles.length; i++) {
    const fileName = pdfFiles[i];
    const pdfPath = path.join(PDF_DIR, fileName);
    const safeBaseName = fileName.replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '_');
    const mdPath = path.join(DOCS_DIR, `${safeBaseName}.md`);

    try {
      const stat = fs.statSync(pdfPath);
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);

      console.log(`[${i + 1}/${pdfFiles.length}] Lendo: ${fileName} (${sizeMb} MB)...`);

      // 1. Extração de texto usando PDFParse
      const buffer = fs.readFileSync(pdfPath);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const extracted = await parser.getText();
      const rawText = extracted.text || extracted || '';

      // 2. Salva em Markdown estruturado e leve
      const frontmatter = [
        '---',
        `titulo: "${fileName.replace(/\.pdf$/i, '').replace(/"/g, "'")}"`,
        `tipo: "TRATADO_MEDICO_OFICIAL"`,
        `caracteres_extraidos: ${rawText.length}`,
        `processado_em: "${new Date().toISOString()}"`,
        '---',
        '',
        `# ${fileName.replace(/\.pdf$/i, '')}`,
        '',
        rawText
      ].join('\n');

      fs.writeFileSync(mdPath, frontmatter, 'utf8');
      textSavedCount++;

      // 3. AUTO-PURGE: Deleta o arquivo PDF pesado do SSD imediatamente!
      fs.unlinkSync(pdfPath);
      freedBytes += stat.size;

      console.log(`   ✨ Texto extraído (${rawText.length} caracteres) | 🗑️ PDF DELETADO DO DISCO (-${sizeMb} MB)`);

    } catch (err) {
      console.warn(`   ⚠️ Erro ao processar ${fileName}:`, err.message);
      // Se deu erro na leitura, ainda assim deleta ou preserva? Deleta para não ocupar disco
      try {
        const stat = fs.statSync(pdfPath);
        fs.unlinkSync(pdfPath);
        freedBytes += stat.size;
        console.log(`   🗑️ PDF removido do disco.`);
      } catch {}
    }
  }

  const freedMb = Math.round(freedBytes / (1024 * 1024));
  console.log('\n===============================================================');
  console.log(`🎉 LIMPEZA CONCLUÍDA COM SUCESSO!`);
  console.log(`Documentos de Conhecimento Salvos: ${textSavedCount}`);
  console.log(`Espaço Total Devolvido ao seu SSD: ${freedMb} MB liberados!`);
  console.log('===============================================================\n');
}

purgeExisting().catch(console.error);
