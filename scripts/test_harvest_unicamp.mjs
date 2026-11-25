import fs from 'fs';

const API_URL = "https://question-hub-bff.sanar.com.br/lunar/questions";
const TOKEN = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";
const UNICAMP_ID = "4b4d516b-7bb3-459e-9740-62a44813a501";

async function testUnicamp() {
  console.log('Fetching UNICAMP questions from Sanar Lunar API...');
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
    body: JSON.stringify({
      institution: { id: UNICAMP_ID },
      limit: 50,
      skip: 0,
      order: "DESC",
      filters: {}
    })
  });

  if (!res.ok) {
    console.error('Fetch error:', res.status, await res.text());
    return;
  }

  const json = await res.json();
  console.log(`Total UNICAMP questions in Sanar: ${json.pagination?.total}`);
  const withImgs = (json.data || []).filter(q => {
    const txt = JSON.stringify(q);
    return txt.includes('.jpg') || txt.includes('.png') || txt.includes('.webp') || txt.includes('assets/');
  });
  console.log(`In first 50: ${withImgs.length} questions contain images`);
}

testUnicamp();
