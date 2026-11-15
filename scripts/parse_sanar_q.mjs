import fs from 'fs';

const html = fs.readFileSync('data/sanar_sample_q.html', 'utf8');

// Search for correct answer markers or JSON data in Sanar
console.log('Contains correct_answer / gabarito / isCorrect:');
const matches = [...html.matchAll(/(isCorrect|gabarito|resposta-correta|correct|correta)[^<]{0,100}/gi)];
matches.slice(0, 10).forEach(m => console.log('Match:', m[0]));

// Also check __NEXT_DATA__
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (nextDataMatch) {
  try {
    const json = JSON.parse(nextDataMatch[1]);
    console.log('\nFound __NEXT_DATA__! Keys:', Object.keys(json.props?.pageProps || {}));
    const pageProps = json.props?.pageProps;
    if (pageProps.question) {
      console.log('Question keys:', Object.keys(pageProps.question));
      console.log('Correct alternative:', pageProps.question.correctAlternative || pageProps.question.answer);
      console.log('Options:', pageProps.question.alternatives?.map(a => ({ letter: a.letter || a.label, text: (a.text || a.body || '').slice(0, 40), isCorrect: a.isCorrect })));
    }
  } catch (e) {
    console.log('Error parsing JSON:', e.message);
  }
}
