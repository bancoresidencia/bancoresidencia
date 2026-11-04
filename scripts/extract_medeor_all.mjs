import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve('data/scraped_medeor');
const RAW_DIR = path.join(BASE_DIR, 'raw');
const META_DIR = path.join(BASE_DIR, 'metadata');
const CONFIG_PATH = path.resolve('scripts/medeor_config.json');

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(META_DIR, { recursive: true });

function getSavedExamIds() {
  const existing = new Set();
  if (fs.existsSync(RAW_DIR)) {
    const years = fs.readdirSync(RAW_DIR);
    for (const y of years) {
      const yDir = path.join(RAW_DIR, y);
      if (fs.statSync(yDir).isDirectory()) {
        const files = fs.readdirSync(yDir);
        for (const f of files) {
          if (f.endsWith('.json')) {
            const parts = f.replace('.json', '').split('_');
            const examId = parts[parts.length - 1];
            existing.add(examId);
          }
        }
      }
    }
  }
  return existing;
}

async function getBrowserSession() {
  // 1. Tenta conectar via CDP na porta 9222 (se Chrome estiver com depuração ativa)
  try {
    console.log('🔍 Tentando conectar ao Chrome aberto na porta 9222 (CDP)...');
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    let page = context.pages().find(p => p.url().includes('medeor.com.br'));
    if (!page) {
      page = await context.newPage();
      await page.goto('https://medeor.com.br/questions/setup', { waitUntil: 'domcontentloaded' });
    }
    console.log('✅ Conectado via CDP com sucesso à página:', page.url());
    return { browser, page, isCDP: true };
  } catch (err) {
    console.log('ℹ️ Porta 9222 não detectada. Verificando scripts/medeor_config.json...');
  }

  // 2. Tenta usar credenciais salvas em scripts/medeor_config.json
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (config.cookies && config.cookies.length > 0) {
        console.log('🔑 Carregando cookies de scripts/medeor_config.json...');
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        await context.addCookies(config.cookies);
        const page = await context.newPage();
        await page.goto('https://medeor.com.br/questions/setup', { waitUntil: 'domcontentloaded' });
        return { browser, page, isCDP: false };
      }
    } catch {}
  }

  // 3. Fallback: Abre janela visível para o usuário autenticar
  console.log('\n===============================================================');
  console.log('⚠️ SESSÃO NÃO DETECTADA AUTOMATICAMENTE');
  console.log('👉 Abrindo janela de login no Chromium para autenticação...');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto('https://medeor.com.br/questions/setup', { waitUntil: 'domcontentloaded' });

  // Aguarda até o usuário estar logado (verifica a cada 2s)
  console.log('⏳ Aguardando confirmação de login na página...');
  while (true) {
    const isAuthed = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/v1/auth/verify');
        return res.ok;
      } catch {
        return false;
      }
    });

    if (isAuthed) {
      console.log('🎉 LOGIN CONFIRMADO COM SUCESSO!');
      // Salva cookies para execuções futuras
      const cookies = await context.cookies();
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ cookies, savedAt: new Date().toISOString() }, null, 2), 'utf8');
      console.log('📁 Cookies de sessão salvos em scripts/medeor_config.json');
      break;
    }
    await page.waitForTimeout(2000);
  }

  return { browser, page, isCDP: false };
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 INICIANDO MOTOR DE COLETA COMPLETA MEDEOR (PROVAS & GABARITOS)');
  console.log('='.repeat(70));

  const { browser, page, isCDP } = await getBrowserSession();

  console.log('\n📋 [1/3] Obtendo catálogo de provas oficiais (/api/v1/simulations/templates/official)...');
  const templates = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/v1/simulations/templates/official');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (e) {
      return { error: e.message };
    }
  });

  if (templates.error || !Array.isArray(templates)) {
    console.error('❌ Erro ao buscar templates de provas:', templates.error || templates);
    console.log('Tentando via catálogo geral de provas / simulados...');
    return;
  }

  console.log(`✅ Catálogo recebido: ${templates.length} provas oficiais encontradas!`);

  // Ordena dos anos mais recentes para os mais antigos
  const sortedTemplates = templates.sort((a, b) => {
    const yearA = Number(a.year || a.exam_year || 0);
    const yearB = Number(b.year || b.exam_year || 0);
    return yearB - yearA;
  });

  const catalogSummary = sortedTemplates.map(t => ({
    id: t.id,
    name: t.name || t.title,
    institution: t.institution || t.institution_name,
    year: t.year || t.exam_year,
    totalQuestions: t.total_questions || t.questions_count,
    category: t.exam_category || t.category
  }));

  fs.writeFileSync(path.join(META_DIR, 'catalog_official_exams.json'), JSON.stringify(catalogSummary, null, 2), 'utf8');
  console.log(`📁 Catálogo ordenado salvo em ${path.join(META_DIR, 'catalog_official_exams.json')}`);

  const alreadySaved = getSavedExamIds();
  console.log(`📊 Provas já coletadas anteriormente: ${alreadySaved.size}`);

  console.log('\n📥 [2/3] Iniciando download das provas com gabaritos completos...');
  let totalColetadas = 0;

  for (let i = 0; i < sortedTemplates.length; i++) {
    const tpl = sortedTemplates[i];
    const templateId = tpl.id;
    const year = String(tpl.year || tpl.exam_year || 'SEM_ANO');
    const institution = (tpl.institution || tpl.institution_name || 'BANCA').replace(/[^a-zA-Z0-9_-]/g, '_');
    const examName = `${institution}_${year}_${templateId}`;

    if (alreadySaved.has(templateId)) {
      console.log(`⏩ [${i + 1}/${sortedTemplates.length}] Já salva: ${examName}`);
      continue;
    }

    console.log(`\n⏳ [${i + 1}/${sortedTemplates.length}] Coletando prova: ${tpl.name || examName} (Ano ${year})...`);

    try {
      // 1. Cria Simulado / Inicia Tentativa para a prova
      const simData = await page.evaluate(async (id) => {
        // Cria simulação baseada no template
        const simRes = await fetch('/api/v1/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template_id: id, title: 'Export Oficial', total_questions: 100 })
        });
        const sim = await simRes.json();
        
        // Inicia a tentativa
        const attRes = await fetch(`/api/v1/simulations/${sim.id}/attempts`, { method: 'POST' });
        const att = await attRes.json();

        // Pega as questões do caderno
        const qRes = await fetch(`/api/v1/simulations/attempts/${att.id}/questions`);
        const questions = await qRes.json();

        // Finaliza a tentativa para desbloquear a revisão com gabarito oficial
        await fetch(`/api/v1/simulations/attempts/${att.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ time_spent_seconds: 60 })
        });

        // Pega a revisão completa (gabarito homologado + resoluções)
        const revRes = await fetch(`/api/v1/simulations/attempts/${att.id}/review`);
        const review = await revRes.json();

        // Limpa a simulação temporária do perfil
        fetch(`/api/v1/simulations/${sim.id}`, { method: 'DELETE' }).catch(() => {});

        return { questions, review };
      }, templateId);

      const yearDir = path.join(RAW_DIR, year);
      fs.mkdirSync(yearDir, { recursive: true });

      const finalExamData = {
        templateId,
        institution,
        year,
        name: tpl.name || tpl.title,
        metadata: tpl,
        questions: simData.questions,
        review: simData.review,
        extractedAt: new Date().toISOString()
      };

      const outPath = path.join(yearDir, `${examName}.json`);
      fs.writeFileSync(outPath, JSON.stringify(finalExamData, null, 2), 'utf8');

      totalColetadas++;
      const qCount = Array.isArray(simData.questions) ? simData.questions.length : (simData.review?.length || 0);
      console.log(`   ✅ Salva com sucesso: ${qCount} questões com gabarito em ${outPath}`);

      // Delay seguro anti-rate-limit (1,5 segundos)
      await page.waitForTimeout(1500);

    } catch (err) {
      console.error(`   ❌ Falha na coleta de ${examName}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`🎉 COLETA CONCLUÍDA: ${totalColetadas} novas provas baixadas com sucesso!`);
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('❌ Erro fatal no extrator:', err);
  process.exit(1);
});
