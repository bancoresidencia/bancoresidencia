import fs from 'fs';

const filePath = 'C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/batch_100_results.json';
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const data = raw.questions;

console.log('Total questions in file:', data.length);

let maxLen = 0, minLen = 9999, totalLen = 0, over650 = 0;
let totalPromptTokens = 0, totalCandidateTokens = 0;

data.forEach(q => {
  const c = q.finalCommentary || '';
  if (c.length > maxLen) maxLen = c.length;
  if (c.length < minLen) minLen = c.length;
  totalLen += c.length;
  if (c.length > 650) over650++;
  
  if (q.usage) {
    totalPromptTokens += q.usage.promptTokenCount || 0;
    totalCandidateTokens += q.usage.candidatesTokenCount || 0;
  }
});

console.log('FinalCommentary character length stats:');
console.log({ minLen, maxLen, avgLen: (totalLen / data.length).toFixed(1), over650 });
console.log('Tokens:');
console.log({
  totalPromptTokens,
  totalCandidateTokens,
  avgPromptTokens: (totalPromptTokens / data.length).toFixed(1),
  avgCandidateTokens: (totalCandidateTokens / data.length).toFixed(1)
});

// Pick 5 diverse questions
const selectedThemes = ['Cardiologia', 'Neurologia', 'Gastroenterologia', 'Pneumologia', 'Endocrinologia'];
const samples = [];

for (const theme of selectedThemes) {
  const q = data.find(item => item.tema === theme);
  if (q) samples.push(q);
}

// Write selected samples to a json file to easily read and display
fs.writeFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/5_sample_questions.json', JSON.stringify(samples, null, 2));
console.log('Samples chosen:', samples.map(s => `${s.code} (${s.tema} - ${s.foco})`));
