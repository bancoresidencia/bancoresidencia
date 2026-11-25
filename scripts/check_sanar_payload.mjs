async function checkPayload() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/InstitutionAutocomplete.js');
  const text = await res.text();
  const idx = text.indexOf('fetchQuestions');
  console.log('Context of fetchQuestions:');
  console.log(text.substring(idx, idx + 1000));
}
checkPayload();
