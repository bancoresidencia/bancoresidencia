async function check() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/InstitutionAutocomplete.js');
  const text = await res.text();
  const idx = text.indexOf('question-hub-bff.sanar.com.br');
  console.log('Context around question-hub-bff:');
  console.log(text.substring(Math.max(0, idx - 200), idx + 800));
}
check();
