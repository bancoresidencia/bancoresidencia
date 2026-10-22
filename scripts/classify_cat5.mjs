import fs from 'fs';
import path from 'path';

const rep = JSON.parse(fs.readFileSync('data/relatorio_auditoria_integral_gabaritos.json', 'utf8'));

const cat5 = rep.details.commentaryExplicitDifferentKey;

// Classificar cada caso de cat5
const type1_trueKeyErrors = []; // Plataforma está errada, gabarito deveria ser o declarado
const type2_headerDiscrepancies = []; // Plataforma está certa, cabeçalho do comentário está desatualizado
const type3_unclearOrComplex = []; // Casos ambíguos que requerem revisão

for (const item of cat5) {
  const comm = (item.commentary_snippet || '').toLowerCase();
  const curT = (item.current_text || '').toLowerCase().slice(0, 35);
  const decT = (item.declared_text || '').toLowerCase().slice(0, 35);

  const curInComm = curT.length > 5 && comm.includes(curT);
  const decInComm = decT.length > 5 && comm.includes(decT);

  if (decInComm && !curInComm) {
    // O comentário cita e defende o texto da declared_text como sendo a resposta certa,
    // enquanto a plataforma está apontando para current_text que não é o defendido!
    type1_trueKeyErrors.push({
      ...item,
      reason: `Comentário defende texto da opção '${item.declared_answer}' ("${item.declared_text.slice(0, 50)}") mas plataforma aponta '${item.current_answer}' ("${item.current_text.slice(0, 50)}")`
    });
  } else if (curInComm && !decInComm) {
    // O comentário traz a letra antiga, mas o texto da opção que está no comentário é exatamente o texto de current_text!
    type2_headerDiscrepancies.push({
      ...item,
      reason: `Opção da plataforma '${item.current_answer}' tem o texto correto ("${item.current_text.slice(0, 50)}"), mas comentário ainda cita a letra antiga '${item.declared_answer}' do caderno original`
    });
  } else {
    type3_unclearOrComplex.push(item);
  }
}

console.log('Classificação da Categoria 5 (1.257 casos):');
console.log(`- Tipo 1: Erros Reais de Gabarito na Plataforma (Gabarito da plataforma aponta alternativa errada): ${type1_trueKeyErrors.length}`);
console.log(`- Tipo 2: Incongruência de Cabeçalho do Comentário (Caderno embaralhado, texto correto na plataforma, letra antiga no texto): ${type2_headerDiscrepancies.length}`);
console.log(`- Tipo 3: Casos Complexos / Textos Parciais que exigem análise mais ampla: ${type3_unclearOrComplex.length}`);

// Salvar a separação
fs.writeFileSync('data/cat5_classification.json', JSON.stringify({
  type1_trueKeyErrors,
  type2_headerDiscrepancies,
  type3_unclearOrComplex
}, null, 2));

console.log('\nSalvo em data/cat5_classification.json');
