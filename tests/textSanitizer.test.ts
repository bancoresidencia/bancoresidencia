import assert from 'node:assert';
import { sanitizeMedicalText, renderFormattedMedicalText } from '../src/utils/textSanitizer.ts';

console.log('=== INICIANDO TESTES DO SANITIZADOR MÉDICO (TEXT SANITIZER) ===\n');

// [1] Teste de Entidades HTML e Entidades Numéricas Decimais
const htmlInput = "Drenagem em selo d&#39;água &#8211; DST&#39;s com estudo &#39;Doppler&#39; e glicemia &gt; 120 e &le; 200 a 37&#176;C.";
const htmlOutput = sanitizeMedicalText(htmlInput);
assert.strictEqual(htmlOutput.includes('&#39;'), false, 'Não deve conter &#39;');
assert.strictEqual(htmlOutput.includes("d'água"), true, "Deve conter d'água");
assert.strictEqual(htmlOutput.includes("–"), true, "Deve conter en-dash do &#8211;");
assert.strictEqual(htmlOutput.includes("DST's"), true, "Deve conter DST's");
assert.strictEqual(htmlOutput.includes("'Doppler'"), true, "Deve conter 'Doppler'");
assert.strictEqual(htmlOutput.includes('> 120'), true, 'Deve conter > 120');
assert.strictEqual(htmlOutput.includes('≤ 200'), true, 'Deve conter ≤ 200');
assert.strictEqual(htmlOutput.includes('37°C'), true, 'Deve conter 37°C');
console.log('✓ [PASS] 1. Entidades HTML (nomeadas e numéricas) decodificadas perfeitamente.');

// [2] Teste de Fórmulas e Símbolos LaTeX
const latexInput = "Endométrio com espessura $\\le$ 4 mm, candidíase com $\\ge$ 3 episódios e $\\beta$-hCG negativo com dose 1x\\dia.";
const latexOutput = sanitizeMedicalText(latexInput);
assert.strictEqual(latexOutput.includes('\\le'), false, 'Não deve conter \\le');
assert.strictEqual(latexOutput.includes('≤ 4 mm'), true, 'Deve conter ≤ 4 mm');
assert.strictEqual(latexOutput.includes('≥ 3 episódios'), true, 'Deve conter ≥ 3 episódios');
assert.strictEqual(latexOutput.includes('β-hCG'), true, 'Deve conter β-hCG');
assert.strictEqual(latexOutput.includes('1x/dia'), true, 'Deve conter 1x/dia');
console.log('✓ [PASS] 2. Códigos LaTeX (\\le, \\ge, \\beta, \\dia) convertidos para tipografia médica oficial.');

// [3] Teste de Remoção de Marcas de Telegram e Cabeçalhos de Apostilas
const telegramInput = `A) Estenose hipertrófica do piloro.
 ALTERNATIVA A
25. Cirurgia Infantil - Parte II
Extensivo - Cirurgia \t216/280
T.ME/MEDOPEN - ACERVO MÉDICO GRATUITO

Estamos diante de um lactente com quadro clínico típico...`;
const telegramOutput = sanitizeMedicalText(telegramInput);
assert.strictEqual(/medopen/i.test(telegramOutput), false, 'Não deve conter MEDOPEN');
assert.strictEqual(/t\.me/i.test(telegramOutput), false, 'Não deve conter T.ME');
assert.strictEqual(/extensivo/i.test(telegramOutput), false, 'Não deve conter Extensivo - Cirurgia');
assert.strictEqual(telegramOutput.includes('Estamos diante de um lactente'), true, 'Deve preservar a explicação clínica legítima');
console.log('✓ [PASS] 3. Marcas dágua de Telegram e paginação de apostilas eliminadas sem afetar o raciocínio médico.');

// [4] Teste de Operadores de Digitação Informais
const opInput = "Febre >= 38ºC, pH <= 4,5 e evolução de rubra -> serosa -> alba com margem de 2 +/- 0,5 cm.";
const opOutput = sanitizeMedicalText(opInput);
assert.strictEqual(opOutput.includes('≥ 38ºC'), true, 'Deve conter ≥ 38ºC');
assert.strictEqual(opOutput.includes('≤ 4,5'), true, 'Deve conter ≤ 4,5');
assert.strictEqual(opOutput.includes('→ serosa →'), true, 'Deve conter setas tipográficas limpas');
assert.strictEqual(opOutput.includes('± 0,5 cm'), true, 'Deve conter ±');
console.log('✓ [PASS] 4. Operadores de digitação informais padronizados.');

// [5] Teste de Unidades Físicas e Fisiologia Arterial
const unitInput = "Paciente com IMC 32 kg/m2, útero de 120 cm3, PaO2 de 65 mmHg e PaCO2 de 40 mmHg com FiO2 de 50%.";
const unitOutput = sanitizeMedicalText(unitInput);
assert.strictEqual(unitOutput.includes('kg/m²'), true, 'Deve conter kg/m²');
assert.strictEqual(unitOutput.includes('cm³'), true, 'Deve conter cm³');
assert.strictEqual(unitOutput.includes('PaO₂'), true, 'Deve conter PaO₂');
assert.strictEqual(unitOutput.includes('PaCO₂'), true, 'Deve conter PaCO₂');
assert.strictEqual(unitOutput.includes('FiO₂'), true, 'Deve conter FiO₂');
console.log('✓ [PASS] 5. Unidades físicas e gases arteriais formatados com rigor acadêmico.');

// [6] Teste das Imagens do Usuário (Imagem 1: Itálico em Bactérias e Células Médicas)
const img1Input = "Na VB, ocorre uma **redução drástica desses lactobacilos**, o que eleva o pH e cria um ambiente propício para o supercrescimento de bactérias **anaeróbicas** (como *Gardnerella vaginalis*, *Atopobium vaginae*, *Mobiluncus* e *Prevotella*). O diagnóstico clínico é firmado pelos **Critérios de Amsel** (presença de 3 de 4: corrimento branco-acinzentado homogêneo, pH > 4,5, teste das aminas positivo e presença de *clue cells* na microscopia).";
const renderedNodes = renderFormattedMedicalText(img1Input) as any[];

assert(Array.isArray(renderedNodes), 'Deve retornar lista de nós React');
// Verifica se gerou nós <em> para os nomes de bactérias
const emNodes = renderedNodes.filter(n => n && typeof n === 'object' && n.type === 'em');
const strongNodes = renderedNodes.filter(n => n && typeof n === 'object' && n.type === 'strong');

assert.strictEqual(strongNodes.length >= 3, true, 'Deve conter nós em negrito (Critérios de Amsel, etc.)');
assert.strictEqual(emNodes.length >= 5, true, 'Deve conter 5 nós em itálico para Gardnerella, Atopobium, Mobiluncus, Prevotella e clue cells');
const italicTexts = emNodes.map(n => n.props.children);
assert.strictEqual(italicTexts.includes('Gardnerella vaginalis'), true, 'Deve conter Gardnerella vaginalis em itálico');
assert.strictEqual(italicTexts.includes('Atopobium vaginae'), true, 'Deve conter Atopobium vaginae em itálico');
assert.strictEqual(italicTexts.includes('Mobiluncus'), true, 'Deve conter Mobiluncus em itálico');
assert.strictEqual(italicTexts.includes('Prevotella'), true, 'Deve conter Prevotella em itálico');
assert.strictEqual(italicTexts.includes('clue cells'), true, 'Deve conter clue cells em itálico');
console.log('✓ [PASS] 6. Imagem 1 do Usuário: Itálicos biológicos renderizados como <em> nativos sem asteriscos residuais.');

console.log('\n======================================================');
console.log('🎉 TODOS OS 6 TESTES DO TEXT SANITIZER PASSARAM 100%!');
console.log('======================================================\n');
