async function check() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/InstitutionAutocomplete.js');
  const text = await res.text();
  console.log('Length:', text.length);
  // Look for fetch or api calls
  const matches = text.match(/fetch\([^)]+\)|axios\.[a-z]+\([^)]+\)|apiBaseUrl[^\n;]+/g) || [];
  console.log('Fetch calls:', matches.slice(0, 15));
}
check();
