async function check() {
  const res = await fetch('https://sanarmed.com/questoes-de-concursos/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const scripts = html.match(/src=["'](https?:\/\/[^"']+\.js[^"']*)["']/gi) || [];
  console.log('Scripts:', scripts.slice(0, 10));

  // Check for inline variables like rest_url or ajax_url
  const wpVars = html.match(/var\s+[a-zA-Z0-9_]+\s*=\s*\{[^}]+\}/g) || [];
  console.log('Vars:', wpVars.slice(0, 5));

  const apis = html.match(/\/wp-json\/[^\s"']+/g) || [];
  console.log('WP JSON endpoints:', [...new Set(apis)]);
}
check();
