import fs from 'fs';

console.log('data/sanar_crawler.db exists?', fs.existsSync('data/sanar_crawler.db'));
if (fs.existsSync('data/sanar_crawler.db')) {
  console.log('Size:', fs.statSync('data/sanar_crawler.db').size);
}
console.log('data/sanar_media exists?', fs.existsSync('data/sanar_media'));
if (fs.existsSync('data/sanar_media')) {
  const orig = fs.existsSync('data/sanar_media/originals') ? fs.readdirSync('data/sanar_media/originals').length : 0;
  const webp = fs.existsSync('data/sanar_media/webp') ? fs.readdirSync('data/sanar_media/webp').length : 0;
  console.log('Originals:', orig, 'Webp:', webp);
}
