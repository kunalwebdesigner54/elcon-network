const fs = require('fs');
const path = require('path');

const dirs = ['elcon-backend', 'elcon-frontend/src'];
const patterns = [/formatDate/i, /toLocaleDateString/i, /getFullYear/i, /moment\(/i, /date-fns/i];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules') search(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (patterns.some(p => p.test(content))) {
        console.log(fullPath);
      }
    }
  }
}

dirs.forEach(search);
