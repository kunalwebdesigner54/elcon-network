const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'node_modules', 'india-state-district', 'dist');
const files = [
  'index.js',
  'assets/india-flag.js',
  'services/india-state-district.factory.js',
  'services/india-state-district.service.js',
  'types/index.js',
];

let fixed = 0;
let skipped = 0;

files.forEach((relativePath) => {
  const filePath = path.join(distDir, relativePath);
  if (!fs.existsSync(filePath)) {
    skipped += 1;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = content.replace(/\/\/#[ \t]*sourceMappingURL=.*$/gm, '');

  if (cleaned !== content) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    fixed += 1;
  }
});

console.log(`Removed sourceMappingURL comments from ${fixed} india-state-district files (${skipped} skipped).`);
