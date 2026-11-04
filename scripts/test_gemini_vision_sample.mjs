import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY='))?.split('=')[1]?.trim();

const refIconBase64 = fs.readFileSync('scripts/assets/medevo_icon_ref.png').toString('base64');
const refFullBase64 = fs.readFileSync('scripts/assets/medevo_logo_full_ref.png').toString('base64');

console.log('1. Carregando watermark_crop.png...');
const imgBuf = fs.readFileSync('scripts/samples_medevo/watermark_crop.png');
const targetBase64 = imgBuf.toString('base64');
console.log('2. Imagem carregada, bytes:', imgBuf.length);

const prompt = `Você é um auditor de marcas e identificadores visuais em questões de medicina.
Temos 2 imagens de referência do logotipo "MedEvo":
- Referência 1: Mascote/ícone de cérebro azul sorridente com uma cruz médica laranja no topo direito.
- Referência 2: Logo institucional com o cérebro azul + cruz laranja e o texto escrito "MedEvo".

Inspecione a IMAGEM MÉDICA ALVO (a 3ª imagem).
Procure por:
1. O mascote/ícone (mesmo que recortado parcialmente, em um canto, invertido ou cortado).
2. O nome/texto "MedEvo" ou variações ("Med", "Evo").
3. Marca d'água oculta ou semitransparente.
4. Logotipo em cabeçalho, rodapé ou cantos.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "has_medevo": boolean,
  "confidence": number,
  "presence_type": "nenhum" | "total" | "parcial_cortado" | "marca_dagua_sutil" | "apenas_texto" | "apenas_icone",
  "location": "nenhum" | "canto_superior_esquerdo" | "canto_superior_direito" | "canto_inferior_esquerdo" | "canto_inferior_direito" | "centro" | "outro",
  "details": "descrição concisa"
}`;

const payload = {
  contents: [
    {
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/png', data: refIconBase64 } },
        { inlineData: { mimeType: 'image/png', data: refFullBase64 } },
        { inlineData: { mimeType: 'image/webp', data: targetBase64 } }
      ]
    }
  ],
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.1
  }
};

const model = 'gemini-3.5-flash-lite';
console.log(`3. Enviando para Gemini (${model})...`);
const t0 = Date.now();
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(60000)
});

console.log(`4. Resposta recebida em ${Date.now() - t0}ms, status:`, res.status);
const data = await res.json();
if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
  console.log('Resultado do Gemini:');
  console.log(data.candidates[0].content.parts[0].text);
} else {
  console.log('Erro:', JSON.stringify(data, null, 2));
}
