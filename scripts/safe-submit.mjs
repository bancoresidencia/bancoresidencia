#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';

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

    // 4. Barreira de Qualidade (Pre-flight QA): Lint e Testes
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
      console.log('✅ Todos os testes passaram com sucesso!');
    } catch {
      console.error('\n❌ BLOQUEADO: Houve falha nos testes unitários.');
      console.error('Não podemos submeter código com testes quebrando.');
      process.exit(1);
    }

    // 5. Definir a mensagem de commit
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

    // 6. Adicionar arquivos e commitar
    console.log('\n💾 [Passo 3/3] Registrando e enviando alterações...');
    run('git add .');
    run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // 7. Enviar para o repositório remoto
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
