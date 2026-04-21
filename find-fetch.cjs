const fs = require('fs');
const path = require('path');

function search(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' && dir !== '.') continue;
    
    // Check files
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Don't search too deep or slow places except our node_modules manually
      if (fullPath.includes('typescript') || fullPath.includes('.cache')) continue;
      search(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.mjs') || fullPath.endsWith('.cjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/fetch\s*=\s*/.test(content) || /defineProperty\([^,]+,\s*['"]fetch['"]/.test(content)) {
        if (!fullPath.includes('node_modules/typescript')) {
           // check if doing window.fetch = or global.fetch =
           if (/(\bwindow|\bglobal|\bglobalThis|\bself)\.fetch\s*=/.test(content)) {
               console.log("MATCH:", fullPath);
           }
        }
      }
    }
  }
}

search('./node_modules');
