async function test() {
  const sitemapRes = await fetch("https://oslermedicina.com.br/sitemap.xml", { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Sitemap status:', sitemapRes.status);
  if (sitemapRes.ok) {
    const text = await sitemapRes.text();
    console.log('Sitemap length:', text.length);
    const urls = text.match(/https:\/\/oslermedicina\.com\.br\/[^\s<"]+/gi) || [];
    console.log('Total URLs in sitemap:', urls.length);
    const fmusp = urls.filter(u => u.includes('fmusp-2026') || u.includes('usp'));
    console.log('FMUSP URLs in sitemap:', fmusp.length);
    if (fmusp.length > 0) {
      console.log('Sample FMUSP sitemap URLs:', fmusp.slice(0, 10));
    }
  }
}
test().catch(console.error);
