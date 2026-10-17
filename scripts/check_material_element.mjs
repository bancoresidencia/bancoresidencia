import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  const items = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      const t = el.innerText?.trim();
      if (t === 'Candidíase Vulvovaginal' || t === 'Vulvovaginites' || t?.includes('Infecções Ginecológicas - Material')) {
        list.push({
          tag: el.tagName,
          text: t,
          href: el.getAttribute('href'),
          onclick: !!el.onclick,
          className: el.className
        });
      }
    });
    return list;
  });

  console.log('Matches:', items);
}

main().catch(console.error);
