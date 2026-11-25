async function checkCallers() {
  const files = [
    'https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/InstitutionAutocomplete.js',
    'https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/assets/js/archive-list.js'
  ];
  for (const f of files) {
    const res = await fetch(f);
    const text = await res.text();
    let pos = 0;
    while ((pos = text.indexOf('fetchQuestions(', pos)) !== -1) {
      console.log(`Caller in ${f.split('/').pop()}:`);
      console.log(text.substring(Math.max(0, pos - 150), pos + 300));
      pos += 15;
    }
  }
}
checkCallers();
