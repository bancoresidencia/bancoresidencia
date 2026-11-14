import fs from 'fs';
const allGabs = JSON.parse(fs.readFileSync('data/abem_gabaritos_2024_2025_2026.json', 'utf8'));
console.log('Q3 Gabarito:', allGabs['2026']['3']);
console.log('Q31 Gabarito:', allGabs['2026']['31']);
console.log('Q59 Gabarito:', allGabs['2026']['59']);
console.log('Q80 Gabarito:', allGabs['2026']['80']);
