import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TARGET_QID = '14359e6d-b900-4a61-856d-85c5f9a9a19d';

const TARGET_COMMENTARY = `Gabarito Oficial: E) Sling retropúbico.

Raciocínio Clínico:
Mulher de 50 anos, multípara (G3P3C0), admitida com quadro de perda involuntária de urina desencadeada por médios esforços físicos, sem sintomas de urgência miccional ou noctúria e sem comorbidades. O quadro clínico é diagnóstico de Incontinência Urinária de Esforço (IUE) pura.
O exame físico normal e sem perda visível de urina decorreu exclusivamente do fato de a bexiga estar vazia no momento da consulta; a manobra de esforço (Valsalva) requer bexiga confortavelmente repleta (volume fisiológico de 200 a 300 mL) para sensibilizar a demonstração objetiva de escape. A ausência de perda em bexiga vazia não invalida nem afasta a história clínica típica.
No manejo da IUE pura, a primeira linha conservadora (fisioterapia do assoalho pélvico / exercícios de Kegel) já foi realizada pela paciente sem resposta clínica. Diante da falha da fisioterapia, a conduta padrão-ouro recomendada pelas diretrizes internacionais (IUGA/ICS) e pela FEBRASGO é o tratamento cirúrgico com sling de uretra média (sling retropúbico).

Análise das Alternativas:
Alternativa A: Incorreta. A orientação de micção programada (urinar a cada 3 horas) é uma medida comportamental de treinamento vesical utilizada no manejo da síndrome da bexiga hiperativa e urge-incontinência, sem efeito mecânico sobre a IUE anatômica refratária.
Alternativa B: Incorreta. Evitar substâncias irritantes vesicais (como cafeína e bebidas alcoólicas) visa diminuir a sensibilidade e contrações involuntárias do detrusor em pacientes com bexiga hiperativa, não corrigindo a hipermobilidade do colo vesical ou a perda aos esforços.
Alternativa C: Incorreta. Agonistas beta-3 adrenérgicos (como a mirabegrona) promovem relaxamento detrusoriano durante o enchimento vesical, sendo indicados na hiperatividade vesical e não na incontinência de esforço pura.
Alternativa D: Incorreta. Anticolinérgicos e antimuscarínicos (como oxibutinina, solifenacina e darifenacina) são a primeira linha farmacológica para hiperatividade do detrusor / incontinência de urgência. Não têm indicação nem benefício no tratamento da IUE pura.
Alternativa E: Correta. Os slings sintéticos de uretra média (como o TVT - via retropúbica) constituem o padrão-ouro cirúrgico para correção da IUE após falha da fisioterapia pélvica, fornecendo suporte suburetral dinâmico com taxas de cura objetiva superiores a 85-90%.

Principal Motivo de Erro:
Confundir a abordagem da Incontinência Urinária de Esforço (IUE) com a da Bexiga Hiperativa / Incontinência de Urgência (IUU), onde se aplicam o treino vesical, a restrição de cafeína, os anticolinérgicos e os agonistas beta-3.

Take-Home Message:
IUE pura com falha documentada de fisioterapia do assoalho pélvico tem como próxima conduta padrão-ouro a indicação cirúrgica de Sling de uretra média (retropúbico).

Referências:
• FEBRASGO. Manual de Uroginecologia e Cirurgia Vaginal. Federação Brasileira das Associações de Ginecologia e Obstetrícia.
• IUGA / ICS Joint Report on the Terminology for Female Pelvic Floor Dysfunction.`;

async function main() {
  console.log('=== ATUALIZAÇÃO E HOMOLOGAÇÃO DE GABARITOS HRAC-USP / CENTRINHO ===\n');

  // 1. Carregar Checkpoints de Ouro
  const goldPath = path.resolve('data/checkpoints/ginecologia_gold_anchors_complete.json');
  const goldAnchors = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
  const hracGold = goldAnchors.filter(x => x.code && x.code.includes('HRAC'));
  console.log(`Carregadas ${hracGold.length} questões da HRAC-USP do arquivo de ouro.`);

  // 2. Carregar ginecologia_final_questions.json
  const gFinalPath = path.resolve('data/ginecologia_final_questions.json');
  const gFinal = JSON.parse(fs.readFileSync(gFinalPath, 'utf8'));
  const gFinalMap = new Map(gFinal.map(q => [q.id, q]));

  // 3. Preparar e executar atualizações no Supabase e no arquivo local
  let updatedCount = 0;

  for (const item of hracGold) {
    const isTarget = item.id === TARGET_QID;
    const finalAnswer = item.official_answer;
    const updatePayload = {
      correct_answer: finalAnswer,
      banca: 'FUVEST',
      is_anulada: finalAnswer === 'ANULADA'
    };

    if (isTarget) {
      updatePayload.commentary = TARGET_COMMENTARY;
    } else {
      updatePayload.commentary = `Gabarito Oficial: Alternativa ${finalAnswer} (Homologado Banca FUVEST / HRAC-USP).`;
    }

    // A. Atualizar no Supabase
    const { error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', item.id);

    if (error) {
      console.error(`❌ Erro ao atualizar questão ${item.code} (${item.id}) no Supabase:`, error.message);
    } else {
      console.log(`✅ Supabase atualizado: ${item.code} -> Gabarito ${finalAnswer}`);
      updatedCount++;
    }

    // B. Atualizar no espelho local ginecologia_final_questions.json
    if (gFinalMap.has(item.id)) {
      const q = gFinalMap.get(item.id);
      q.correct_answer = finalAnswer;
      q.correctAnswer = finalAnswer;
      q.banca = 'FUVEST';
      q.is_anulada = finalAnswer === 'ANULADA';
      q.isAnulada = finalAnswer === 'ANULADA';
      q.commentary = updatePayload.commentary;
      if (isTarget) {
        q.mainErrorReason = updatePayload.mainErrorReason;
        q.takeHomeMessage = updatePayload.takeHomeMessage;
      }
    }
  }

  // 4. Salvar arquivo local higienizado
  fs.writeFileSync(gFinalPath, JSON.stringify(gFinal, null, 2));
  console.log(`\n📁 Arquivo local ${gFinalPath} salvo com sucesso!`);

  // 5. Validação final no Supabase para a questão alvo
  const { data: verifyTarget } = await supabase
    .from('questions')
    .select('id, code, banca, correct_answer, commentary')
    .eq('id', TARGET_QID)
    .single();

  console.log('\n--- CONFIRMAÇÃO DO SUPABASE PARA A QUESTÃO ALVO ---');
  console.log('ID:', verifyTarget.id);
  console.log('Código:', verifyTarget.code);
  console.log('Banca:', verifyTarget.banca);
  console.log('Gabarito Oficial:', verifyTarget.correct_answer);
  console.log('Comentário (primeiros 100 caracteres):', verifyTarget.commentary.slice(0, 100) + '...');
  console.log('----------------------------------------------------');
}

main().catch(console.error);
