import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const ROOT_FOLDER_ID = '1ssJVFdvRGZN8g4l6NoMwHiKrQhhLpNse';
const CATALOG_PATH = path.join(process.cwd(), 'data', 'medcurso_all_questoes_folders.json');

async function main() {
  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined
  });
  const page = await context.newPage();

  let allQuestoesFolders = [];
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      allQuestoesFolders = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    } catch {}
  }

  const existingFolderIds = new Set(allQuestoesFolders.map(x => x.questoesFolderId));
  const visitedIds = new Set(['_gd', ROOT_FOLDER_ID, ...existingFolderIds]);

  async function listChildren(folderId, currentName = '') {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(`https://drive.google.com/drive/u/3/folders/${folderId}`, {
          waitUntil: 'domcontentloaded',
          timeout: 25000
        });
        await page.waitForTimeout(3000);

        const items = await page.evaluate((currName) => {
          const rows = Array.from(document.querySelectorAll('[data-id]'));
          const map = new Map();
          for (const r of rows) {
            const id = r.getAttribute('data-id');
            const text = (r.innerText || '').split('\n')[0].trim();
            if (
              id &&
              text &&
              text.length > 1 &&
              text !== 'MEDCURSO 2026' &&
              text !== currName &&
              !map.has(id)
            ) {
              map.set(id, text);
            }
          }
          return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
        }, currentName);

        return items.filter(x => !visitedIds.has(x.id));
      } catch (err) {
        if (attempt === 2) {
          console.warn(`⚠️ Falha ao listar ${folderId} (${currentName}):`, err.message);
          return [];
        }
        await page.waitForTimeout(2000);
      }
    }
    return [];
  }

  console.log('🔍 Listando especialidades principais...');
  const rootChildren = await listChildren(ROOT_FOLDER_ID, 'MEDCURSO 2026');
  const specialties = rootChildren.filter(item =>
    !item.name.includes('#Med Eletro') &&
    !item.name.includes('Mentoria') &&
    !item.name.includes('.txt')
  );

  console.log(`Encontradas ${specialties.length} especialidades.`);

  for (const spec of specialties) {
    // Se for Clínica Médica e já temos dezenas mapeadas, verifica se precisa avançar
    const jaMapeadasSpec = allQuestoesFolders.filter(x => x.specialty === spec.name).length;
    if (jaMapeadasSpec >= 40) {
      console.log(`⏭️ Especialidade ${spec.name} já contém ${jaMapeadasSpec} temas catalogados.`);
      continue;
    }

    console.log(`\n📂 Mapeando especialidade: ${spec.name}...`);
    visitedIds.add(spec.id);
    const queue = [{ id: spec.id, name: spec.name, path: spec.name }];

    while (queue.length > 0) {
      const current = queue.shift();
      const children = await listChildren(current.id, current.name);

      const questoesSub = children.find(c => c.name.toLowerCase().includes('quest'));
      if (questoesSub) {
        visitedIds.add(questoesSub.id);
        console.log(`   🎯 Questões em: ${current.path} -> ${questoesSub.name} (${questoesSub.id})`);
        allQuestoesFolders.push({
          specialty: spec.name,
          theme: current.name,
          path: current.path,
          questoesFolderId: questoesSub.id,
          questoesFolderName: questoesSub.name
        });
        fs.writeFileSync(CATALOG_PATH, JSON.stringify(allQuestoesFolders, null, 2));
      } else {
        for (const child of children) {
          if (
            !visitedIds.has(child.id) &&
            !child.name.includes('.pdf') &&
            !child.name.includes('.html') &&
            !child.name.includes('.txt') &&
            !child.name.includes('Apostila') &&
            !child.name.includes('Video aula') &&
            !child.name.includes('Resumo') &&
            !child.name.includes('No Papo') &&
            !child.name.includes('Bônus')
          ) {
            visitedIds.add(child.id);
            queue.push({
              id: child.id,
              name: child.name,
              path: `${current.path} > ${child.name}`
            });
          }
        }
      }
    }
  }

  console.log(`\n===============================================================`);
  console.log(`✅ MAPEAMENTO COMPLETO: ${allQuestoesFolders.length} temas com pasta 'Questões' encontrados!`);
  console.log(`===============================================================\n`);

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(allQuestoesFolders, null, 2));
  await browser.close();
}

main().catch(console.error);
