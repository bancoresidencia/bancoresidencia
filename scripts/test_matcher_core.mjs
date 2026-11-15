import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';

function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMd5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const w1 = s1.split(' ');
  const w2 = s2.split(' ');
  const set1 = new Set(w1);
  const set2 = new Set(w2);

  let intersection = 0;
  for (const w of set1) {
    if (set2.has(w)) intersection++;
  }
  const dice = (2 * intersection) / (set1.size + set2.size);
  return Math.round(dice * 100) / 100;
}

console.log('Testing normalizer and MD5...');
const s = 'Paciente de 45 anos, hipertenso...';
console.log('Normalized:', normalizeText(s));
console.log('MD5:', getMd5(normalizeText(s)));
