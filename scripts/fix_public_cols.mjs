import fs from 'fs';

let content = fs.readFileSync('src/services/questionService.ts', 'utf8');
const oldStr = "const publicCols = 'id,code,institution,banca,year,tipo_prova,modalidade,especialidade,tema,foco,subfoco,difficulty,type,is_anulada,statement,options,images';";
const newStr = "const publicCols = 'id,code,institution,banca,year,tipo_prova,modalidade,especialidade,tema,foco,subfoco,difficulty,type,is_anulada,statement,options,images,has_gabarito';";

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/services/questionService.ts', content, 'utf8');
  console.log('✅ publicCols corrigido com has_gabarito!');
} else {
  console.log('ℹ️ publicCols já atualizado ou não encontrado.');
}

