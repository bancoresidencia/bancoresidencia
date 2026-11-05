#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

function run(cmd, options = {}) {
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf-8', ...options });
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
  } catch (err) {
    return null;
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

console.log('\n=========================================');
console.log('🚀 INICIANDO SUBMIT SEGURO (SAFE-SUBMIT)');
console.log('=========================================\n');

async function main() {
  try {
    // 1. Identificar branch
    const currentBranch = runSilent('git branch --show-current') || 'main';
    console.log(`📌 Branch atual: [${currentBranch}]`);

    // 2. Verificar se há alterações para commitar
    const statusOutput = runSilent('git status --porcelain');
    const hasChanges = Boolean(statusOutput && statusOutput.trim().length > 0);

    if (!hasChanges) {
      console.log('ℹ️ Nenhuma alteração detectada para submeter.');
      console.log('Seu repositório local já está limpo e sincronizado.');
      process.exit(0);
    }

    console.log('📋 Arquivos modificados/criados detectados:');
    run('git status --short');

    // 3. Validação prévia: Garantir que não está desatualizado com o GitHub
    console.log('\n🌐 Verificando sincronização com o GitHub (git fetch)...');
    run('git fetch origin');

    const behindCount = runSilent(`git rev-list --count HEAD..origin/${currentBranch}`);
    if (behindCount && parseInt(behindCount, 10) > 0) {
      console.error(`\n⛔ BLOQUEADO POR SEGURANÇA: O GitHub possui ${behindCount} commit(s) que ainda não estão no seu computador!`);
      console.error(`👉 Para evitar conflitos e rejeição do envio, execute primeiro:`);
      console.error(`   npm run pull`);
      console.error(`Depois de atualizar, você poderá rodar o submit com total segurança.\n`);
      process.exit(1);
    }

    // 4. Barreira de Proteção contra Arquivos Pesados Acidentais em src/ (> 1.5MB)
    console.log('\n🛡️ [Proteção de Bundle] Verificando se há arquivos gigantes em src/...');
    const largeFiles = [];
    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scanDir(full);
        else if (entry.isFile()) {
          const stats = fs.statSync(full);
          if (stats.size > 1.5 * 1024 * 1024 && !entry.name.endsWith('.map')) {
            largeFiles.push({ file: full, sizeMb: (stats.size / 1024 / 1024).toFixed(2) });
          }
        }
      }
    }
    if (fs.existsSync('src')) scanDir('src');
    if (largeFiles.length > 0) {
      console.error('\n❌ BLOQUEADO: Foram encontrados arquivos gigantes em src/ que inflariam o bundle:');
      largeFiles.forEach(f => console.error(`   - ${f.file} (${f.sizeMb} MB)`));
      console.error('Mova esses arquivos para fora de src/ ou utilize carregamento remoto.\n');
      process.exit(1);
    }
    console.log('✅ Nenhum arquivo pesado encontrado em src/ (limite de 1.5MB respeitado)!');

    // 5. Barreira de Qualidade (Pre-flight QA): Lint e Testes
    console.log('\n🔍 [Passo 1/3] Executando verificação de código (ESLint)...');
    try {
      run('npm run lint');
      console.log('✅ ESLint aprovado sem erros!');
    } catch {
      console.error('\n❌ BLOQUEADO: Existem erros de código ou lint apontados pelo ESLint.');
      console.error('Corrija os erros listados acima antes de submeter ao repositório.');
      process.exit(1);
    }

    console.log('\n🧪 [Passo 2/3] Executando suíte de testes unitários...');
    try {
      run('npm run test:irt');
      if (fs.existsSync('scripts/tests/test_fase4_bundle_analysis.mjs')) {
        run('node scripts/tests/test_fase4_bundle_analysis.mjs');
      }
      const optTests = [
        'scripts/tests/test_opt_fase1_ghost_refetch.mjs',
        'scripts/tests/test_opt_fase2_prefetch.mjs',
        'scripts/tests/test_opt_fase3_facet_storm.mjs',
        'scripts/tests/test_opt_fase4_fast_search.mjs',
        'scripts/tests/test_opt_fase5_solve_pipeline.mjs'
      ];
      for (const ot of optTests) {
        if (fs.existsSync(ot)) run('node ' + ot);
      }
      console.log('✅ Todos os testes passaram com sucesso!');
    } catch {
      console.error('\n❌ BLOQUEADO: Houve falha nos testes unitários.');
      console.error('Não podemos submeter código com testes quebrando.');
      process.exit(1);
    }

    // 6. Definir a mensagem de commit
    let commitMessage = process.argv.slice(2).join(' ').trim();
    if (!commitMessage) {
      if (process.stdin.isTTY) {
        commitMessage = await askQuestion('\n💬 Digite uma breve descrição do que você fez (ou aperte ENTER para usar padrão): ');
      }
    }

    if (!commitMessage) {
      const now = new Date();
      const dataStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
      commitMessage = `feat: atualizações do sistema (${dataStr})`;
    }

    console.log(`\n📝 Mensagem de commit: "${commitMessage}"`);

    // 7. Adicionar arquivos e commitar
    console.log('\n💾 [Passo 3/3] Registrando e enviando alterações...');
    run('git add .');
    run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // 8. Enviar para o repositório remoto
    console.log(`\n⬆️ Enviando para o GitHub (origin/${currentBranch})...`);
    run(`git push origin ${currentBranch}`);

    const lastCommit = runSilent('git log -1 --oneline');

    console.log('\n======================================================');
    console.log('🎉 SUBMISSÃO CONCLUÍDA COM TOTAL SUCESSO E ZERO RISCO!');
    console.log(`Último commit enviado: ${lastCommit}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Erro durante o processo de submit seguro:', error.message);
    process.exit(1);
  }
}

main();
