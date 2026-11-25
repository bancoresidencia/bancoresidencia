import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');
const qSchema = db.prepare("PRAGMA table_info('questions')").all();
console.log('Schema questions:', qSchema.map(c => c.name));

const imgSchema = db.prepare("PRAGMA table_info('question_images')").all();
console.log('Schema question_images:', imgSchema.map(c => c.name));

const sampleQ = db.prepare("SELECT * FROM questions LIMIT 2").all();
console.log('Sample questions:', sampleQ);

const sampleImg = db.prepare("SELECT * FROM question_images LIMIT 5").all();
console.log('Sample question_images:', sampleImg);
