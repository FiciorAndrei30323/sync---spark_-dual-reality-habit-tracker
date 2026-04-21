const fs = require('fs');
const path = require('path');
function search(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('fetch =')) {
        console.log("MATCH:", fullPath);
      }
    }
  }
}
search('node_modules/.vite/deps');
