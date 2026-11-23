import sharp from 'sharp';

async function checkUSG() {
  const url = 'https://lunar.cetrus.sanar.com.br/assets/a934aa60-24ca-43d1-b18b-63768b2aae49.png';
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());

  const meta = await sharp(buf).metadata();
  console.log('Statement USG metadata:', meta);

  // Check center color diff
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let maxDiff = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const diff = Math.abs(data[i] - data[i + 2]);
    if (diff > maxDiff) maxDiff = diff;
  }
  console.log('Max R-B difference across statement image:', maxDiff);
}

checkUSG().catch(console.error);
