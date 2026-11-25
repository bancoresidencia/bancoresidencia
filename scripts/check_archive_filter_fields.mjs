async function checkFilterFields() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/archive-list.js');
  const text = await res.text();
  const matches = text.match(/filters\.[a-zA-Z0-9_]+/g) || [];
  console.log('Filters properties used in archive-list.js:', [...new Set(matches)]);
}
checkFilterFields();
