async function inspectImages() {
  const oslerUrl = 'https://oslermedicina.com.br/questoes/fmusp-2026-4939f1e181da40688aaae6ec0776ccef';
  const sanarUrl = 'https://sanarmed.com/q/crianccedila-sexo-masculino-3-anos-e-7-meses-de-vida-comparece-agrave-consulta/';

  console.log('Fetching Osler page...');
  const oRes = await fetch(oslerUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const oHtml = await oRes.text();
  const oImgs = oHtml.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  console.log('Osler images:', oImgs);

  console.log('\nFetching Sanar page...');
  const sRes = await fetch(sanarUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const sHtml = await sRes.text();
  const sImgs = sHtml.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  const sClean = sImgs.filter(u => u.includes('assets') || u.includes('lunar') || u.includes('cetrus'));
  console.log('Sanar images:', sClean);
}

inspectImages().catch(console.error);
