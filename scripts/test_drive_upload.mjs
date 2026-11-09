import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const FOLDER_ID = '1rrI66doGBIatIROX4KseWtl9Y6l3POy9';
const KEY_FILE = path.join(process.cwd(), 'scripts', 'service-account.json');

async function testUpload() {
  console.log('🚀 Iniciando teste de upload para o Google Drive...');
  console.log(`📁 Pasta Alvo ID: ${FOLDER_ID}`);

  if (!fs.existsSync(KEY_FILE)) {
    throw new Error(`Arquivo de credenciais não encontrado em: ${KEY_FILE}`);
  }

  const credentials = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'));

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const testFileName = `teste_conexao_${Date.now()}.txt`;
  const testContent = `Conexão bem sucedida com o Google Drive!\nData: ${new Date().toISOString()}\nPlataforma: Banco Residência`;
  const tempFilePath = path.join(process.cwd(), 'scripts', testFileName);

  fs.writeFileSync(tempFilePath, testContent, 'utf-8');

  try {
    const fileMetadata = {
      name: testFileName,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(tempFilePath),
    };

    console.log('⏳ Enviando arquivo de teste...');
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink',
    });

    console.log('\n🎉 SUCESSO TOTAL!');
    console.log(`📄 Nome do arquivo: ${response.data.name}`);
    console.log(`🆔 ID no Drive: ${response.data.id}`);
    console.log(`🔗 Link de visualização: ${response.data.webViewLink}`);
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

testUpload().catch((err) => {
  console.error('\n❌ ERRO NO UPLOAD:');
  console.error(err.message || err);
  process.exit(1);
});
