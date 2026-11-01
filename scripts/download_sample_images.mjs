import fs from 'fs';

const medevoList = JSON.parse(fs.readFileSync('scripts/medevo_image_url_questions.json', 'utf8'));

async function downloadSamples() {
  fs.mkdirSync('scripts/samples_medevo', { recursive: true });
  for (let i = 0; i < Math.min(10, medevoList.length); i++) {
    const item = medevoList[i];
    const url = item.images[0].url;
    console.log(`Downloading sample ${i+1}: ${url}`);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const ext = url.split('.').pop().split('?')[0] || 'jpg';
        const cleanCode = (item.code || 'nocode').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `scripts/samples_medevo/sample_${i+1}_${cleanCode}.${ext}`;
        fs.writeFileSync(filename, buf);
        console.log(`Saved ${filename} (${buf.length} bytes)`);
      } else {
        console.log(`HTTP ${res.status} for ${url}`);
      }
    } catch (e) {
      console.log(`Error downloading ${url}: ${e.message}`);
    }
  }
}
downloadSamples();
