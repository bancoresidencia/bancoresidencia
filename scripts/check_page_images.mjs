async function check() {
  const oslerUrl = "https://oslermedicina.com.br/questoes/fmusp-2026-834d34eee22d482a8bdf8ab51657ec8c";
  const sanarUrl = "https://sanarmed.com/q/vocecirc-eacute-responsaacutevel-pela-organizaccedilatildeo-de-uma-pesquisa/";

  const oslerRes = await fetch(oslerUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const oslerText = await oslerRes.text();
  const oslerImgs = oslerText.match(/\/api\/images\/content\/[^\s"']+/gi) || [];
  console.log('Osler content images:', oslerImgs);

  const sanarRes = await fetch(sanarUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const sanarText = await sanarRes.text();
  const sanarImgs = sanarText.match(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/[a-f0-9\-]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  console.log('Sanar images:', sanarImgs);
}
check();
