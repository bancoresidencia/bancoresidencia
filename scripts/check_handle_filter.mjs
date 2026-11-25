async function checkFilters() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/archive-list.js');
  const text = await res.text();
  const idx = text.indexOf('handleFilter()');
  console.log('handleFilter code:');
  console.log(text.substring(idx, idx + 1200));
}
checkFilters();
