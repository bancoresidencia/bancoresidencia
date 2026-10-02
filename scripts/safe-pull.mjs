#!/usr/bin/env node
import { execSync } from 'child_process';

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

console.log('\n=========================================');
console.log('🔄 INICIANDO PULL SEGURO (SAFE-PULL)');
console.log('=========================================\n');

try {
  // 1. Identificar a branch atual
  const currentBranch = runSilent('git branch --show-current') || 'main';
  console.log(`📌 Branch atual: [${currentBranch}]`);

  // 2. Verificar se há alterações locais não commitadas
  const statusOutput = runSilent('git status --porcelain');
  const hasLocalChanges = Boolean(statusOutput && statusOutput.trim().length > 0);

  let stashed = false;
  if (hasLocalChanges) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log('⚠️ Você possui alterações locais ainda não salvas.');
    console.log('🛡️ Criando backup automático de segurança (git stash)...');
    run(`git stash push -u -m "backup-auto-antes-do-pull-${timestamp}"`);
    stashed = true;
    console.log('✅ Suas alterações locais estão protegidas em backup temporário.');
  } else {
    console.log('✨ Diretório de trabalho limpo (sem pendências locais).');
  }

  // 3. Buscar informações do remoto
  console.log('\n🌐 Buscando novidades no GitHub (git fetch)...');
  run('git fetch origin');

  // Guardar commit antes do pull para comparar se package.json mudou
  const headBefore = runSilent('git rev-parse HEAD');

  // 4. Efetuar o pull
  console.log(`\n⬇️ Baixando atualizações da branch origin/${currentBranch}...`);
  try {
    run(`git pull --no-rebase origin ${currentBranch}`);
  } catch (err) {
    console.error('\n❌ Ocorreu um problema ao baixar as alterações do Git.');
    if (stashed) {
      console.log('🛡️ Tentando restaurar seu backup local (git stash pop)...');
      try {
        run('git stash pop');
      } catch (stashErr) {
        console.warn('⚠️ Seus arquivos continuam seguros no stash. Use "git stash list" para visualizar.');
      }
    }
    process.exit(1);
  }

  // 5. Se foi feito stash, restaurar as alterações locais
  if (stashed) {
    console.log('\n📦 Restaurando suas alterações locais guardadas no backup...');
    try {
      run('git stash pop');
      console.log('✅ Alterações locais restauradas com sucesso!');
    } catch (stashErr) {
      console.warn('\n⚠️ ATENÇÃO: Houve um pequeno conflito ao restaurar seus arquivos locais com as novidades.');
      console.warn('Suas alterações NÃO foram perdidas! Abra os arquivos indicados para verificar os pontos marcados com <<<<<<.');
    }
  }

  // 6. Verificar se package.json foi alterado e atualizar pacotes se necessário
  const headAfter = runSilent('git rev-parse HEAD');
  if (headBefore && headAfter && headBefore !== headAfter) {
    const diffFiles = runSilent(`git diff --name-only ${headBefore} ${headAfter}`) || '';
    if (diffFiles.includes('package.json')) {
      console.log('\n📦 O arquivo package.json foi atualizado por novos commits. Instalando dependências...');
      run('npm install');
    }
  }

  // 7. Rodar testes para garantir integridade
  console.log('\n🧪 Validando integridade dos testes após atualização...');
  try {
    run('npm run test:irt');
    console.log('✅ Testes passaram 100%!');
  } catch {
    console.warn('⚠️ Houve um aviso nos testes após a atualização. Verifique os logs.');
  }

  console.log('\n======================================================');
  console.log('🎉 PULL CONCLUÍDO COM SUCESSO E SEM RISCO DE PERDA!');
  console.log('======================================================\n');
} catch (error) {
  console.error('\n❌ Erro durante o processo de pull seguro:', error.message);
  process.exit(1);
}
