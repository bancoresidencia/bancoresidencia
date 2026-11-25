async function fetchJs() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/archive-list.js?ver=1792804171');
  const text = await res.text();
  console.log('Length:', text.length);
  // Look for endpoints
  const matches = text.match(/https?:\/\/[^\s"'`]+|\/[a-zA-Z0-9_\-\/]+/g) || [];
  const endpoints = matches.filter(m => m.includes('api') || m.includes('lunar') || m.includes('question') || m.includes('search'));
  console.log('Endpoints in archive-list.js:', [...new Set(endpoints)].slice(0, 20));
  // print first 1500 chars of JS
  console.log('JS Snippet:', text.substring(0, 1000));
}
fetchJs();
