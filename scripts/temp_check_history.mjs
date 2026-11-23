import { execSync } from 'child_process';
import fs from 'fs';

try {
  const commitsRaw = execSync('git log --format="%h %ad %s" --date=short -- data/checkpoints', { encoding: 'utf8' })
    .trim()
    .split('\n');

  console.log(`Found ${commitsRaw.length} commits touching data/checkpoints.`);
  
  // Sort from oldest to newest
  const commits = commitsRaw.map(l => {
    const parts = l.split(' ');
    return {
      hash: parts[0],
      date: parts[1],
      subject: parts.slice(2).join(' ')
    };
  }).reverse();

  const dailyProgress = {};

  for (const c of commits) {
    try {
      const files = execSync(`git ls-tree -r --name-only ${c.hash} data/checkpoints`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f.endsWith('_deep_solved.json'));

      let commitTotal = 0;
      const details = {};

      for (const f of files) {
        try {
          // Read the file from git
          const jsonText = execSync(`git show ${c.hash}:${f}`, { encoding: 'utf8', maxBuffer: 150 * 1024 * 1024 });
          const arr = JSON.parse(jsonText);
          const name = f.replace('data/checkpoints/', '').replace('_deep_solved.json', '');
          details[name] = arr.length;
          commitTotal += arr.length;
        } catch (err) {
          // parse or buffer error
        }
      }

      console.log(`${c.date} | ${c.hash} | Total: ${commitTotal} | ${c.subject.slice(0, 50)} | ${JSON.stringify(details)}`);
      dailyProgress[c.date] = {
        total: commitTotal,
        details,
        lastCommit: c.hash,
        subject: c.subject
      };
    } catch (err) {
      console.error(`Error in commit ${c.hash}:`, err.message);
    }
  }

  console.log('\n--- FINAL DAILY SUMMARY ---');
  console.log(JSON.stringify(dailyProgress, null, 2));
} catch (e) {
  console.error(e);
}
