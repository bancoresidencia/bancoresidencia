import { clinicalHierarchy } from '../src/data/mockQuestions.ts';

const searchTerms = [
  'Taxas de Mortalidade',
  'Medidas de Contenção',
  'Padronização de Taxas',
  'Tipos de Bacia Obstétrica',
  'Diagnóstico Clínico, Exames de Imagem e Classificação FIGO'
];

for (const term of searchTerms) {
  let found = false;
  for (const esp of clinicalHierarchy) {
    for (const t of esp.temas) {
      if (t.tema.includes(term)) {
        console.log(`[TEMA] "${term}" em ${esp.especialidade} > ${t.tema}`);
        found = true;
      }
      for (const f of t.focos) {
        if (f.foco.includes(term)) {
          console.log(`[FOCO] "${term}" em ${esp.especialidade} > ${t.tema} > ${f.foco}`);
          found = true;
        }
        for (const s of f.subfocos) {
          if (s.subfoco.includes(term)) {
            console.log(`[SUBFOCO] "${term}" em ${esp.especialidade} > ${t.tema} > ${f.foco} > ${s.subfoco}`);
            found = true;
          }
          for (const ss of s.sub_subfocos || []) {
            if (ss.includes(term)) {
              console.log(`[SUB_SUBFOCO] "${term}" em ${esp.especialidade} > ${t.tema} > ${f.foco} > ${s.subfoco} > ${ss}`);
              found = true;
            }
          }
        }
      }
    }
  }
  if (!found) console.log(`Não encontrado: "${term}"`);
}

