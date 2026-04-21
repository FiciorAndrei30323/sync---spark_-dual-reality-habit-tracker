const fs = require('fs');
const path = require('path');

function search(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'typescript' || entry.name === 'eslint' || entry.name === '.cache') continue;
    
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.mjs') || fullPath.endsWith('.cjs')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/(\w+)(?:\.|\[')fetch(?:'\])?\s*=/.test(content)) {
          // let's narrow it down
          const matches = content.match(/(\w+)(?:\.|\[')fetch(?:'\])?\s*=/g);
          for (const match of matches) {
             const prefix = match.split(/\.|\[/)[0];
             if (['window', 'globalThis', 'global', 'self', '_global', 'g'].includes(prefix) || match.includes('fetch')) {
                 if (fullPath.includes('node_modules')) {
                     console.log("MATCH NODE MODULE:", fullPath, match);
                 } else {
                     console.log("MATCH:", fullPath, match);
                 }
                 break;
             }
          }
        }
      } catch (e) {}
    }
  }
}

search('.');
