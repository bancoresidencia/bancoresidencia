import fs from 'fs';

const GABARITOS = {
  TIPO_1: [
    'A','A','C','B','B','D','A','D','A','-', // 1-10
    'B','A','A','B','B','-','D','B','C','-', // 11-20
    '-','D','B','B','C','C','A','D','C','D', // 21-30
    'A','A','B','A','B','D','C','-','D','C', // 31-40
    'C','A','C','B','A','C','D','-','A','-', // 41-50
    'C','D','D','C','C','C','A','C','B','B', // 51-60
    'D','B','C','A','C','B','A','D','B','D', // 61-70
    'C','A','D','C','C','A','-','A','C','C', // 71-80
    'B','C','D','D','A','C','A','B','-','-', // 81-90
    'D','A','C','C','D','A','D','B','C','A'  // 91-100
  ],
  TIPO_2: [
    'A','A','-','D','B','-','A','C','-','A', // 1-10
    'D','A','B','B','D','B','B','A','B','C', // 11-20
    '-','A','D','C','B','C','A','D','D','C', // 21-30
    'D','D','A','C','B','C','A','-','B','B', // 31-40
    'C','D','C','A','B','B','D','-','B','A', // 41-50
    'A','-','C','A','C','C','C','C','D','C', // 51-60
    'D','A','A','-','A','C','A','D','C','B', // 61-70
    'B','D','C','C','B','C','C','A','D','C', // 71-80
    'B','A','A','D','D','A','A','-','C','C', // 81-90
    'B','-','D','A','D','C','C','B','C','D'  // 91-100
  ],
  TIPO_3: [
    'A','-','B','B','C','B','-','A','A','B', // 1-10
    '-','C','A','B','B','D','A','D','A','D', // 11-20
    '-','C','B','B','C','B','D','A','A','D', // 21-30
    'A','D','B','A','-','D','C','D','C','C', // 31-40
    'C','B','B','C','A','C','C','D','D','-', // 41-50
    'C','B','D','C','C','A','-','C','A','A', // 51-60
    'D','C','A','C','C','A','C','A','A','D', // 61-70
    'C','C','D','C','A','B','B','D','-','B', // 71-80
    'A','B','D','D','A','D','A','A','-','A', // 81-90
    'D','C','C','B','C','B','C','C','D','-'  // 91-100
  ]
};

const knownAnswers = {
  // CIR 19 Qs: 20135 to 20153
  CIR: ['B','C','B','B','B','D','D','B','A','A','A','D','C','D','A','C','A','A','A'],
  // GIN 7 Qs: 12600 to 12606
  GIN: ['-','C','A','B','A','C','A'],
  // PED 25 Qs: 22831 to 22855 (note: 22843 is index 12, missing)
  PED: ['D','C','A','C','A','A','A','C','A','C','A','C','?','B','B','A','D','A','C','A','C','A','D','A','D']
};

for (const [tName, gb] of Object.entries(GABARITOS)) {
  console.log(`\n================ Checking against ${tName} ================`);
  // Check where CIR might match (length 19)
  for (let offset = 0; offset <= 100 - 19; offset++) {
    let match = true;
    for (let i = 0; i < 19; i++) {
      if (gb[offset + i] !== knownAnswers.CIR[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      console.log(`CIR matches exactly at questions ${offset + 1} to ${offset + 19}!`);
    }
  }

  // Check where GIN might match (length 7)
  for (let offset = 0; offset <= 100 - 7; offset++) {
    let match = true;
    for (let i = 0; i < 7; i++) {
      if (gb[offset + i] !== knownAnswers.GIN[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      console.log(`GIN matches exactly at questions ${offset + 1} to ${offset + 7}!`);
    }
  }

  // Check where PED might match (length 25, ignoring index 12 '?')
  for (let offset = 0; offset <= 100 - 25; offset++) {
    let match = true;
    for (let i = 0; i < 25; i++) {
      if (knownAnswers.PED[i] !== '?' && gb[offset + i] !== knownAnswers.PED[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      console.log(`PED matches exactly at questions ${offset + 1} to ${offset + 25}! Missing Q at ${offset + 13} would be: ${gb[offset + 12]}`);
    }
  }
}

