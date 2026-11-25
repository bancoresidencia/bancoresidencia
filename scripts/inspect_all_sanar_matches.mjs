import fs from 'fs';

console.log('Reading data/sanar_all_matches_complete.json...');
if (fs.existsSync('data/sanar_all_matches_complete.json')) {
  const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
  console.log(`Total matches in sanar_all_matches_complete: ${matches.length}`);
  console.log('Sample match:', matches[0]);

  let withImages = 0;
  for (const m of matches) {
    if (m.sanar_images && m.sanar_images.length > 0) withImages++;
    else if (m.images && m.images.length > 0) withImages++;
  }
  console.log(`Matches with sanar images: ${withImages}`);
} else {
  console.log('File data/sanar_all_matches_complete.json does not exist');
}
