const fs = require('fs');
const path = require('path');
const distFiles = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js'));
for (const file of distFiles) {
  const content = fs.readFileSync(path.join('dist/assets', file), 'utf8');
  let regex = /.{0,30}fetch.{0,30}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      if (match[0].includes('=')) {
          console.log(match[0]);
      }
  }
}
