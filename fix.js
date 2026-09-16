const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const frontendPath = path.join(__dirname, 'elcon-frontend', 'src');
const files = walkSync(frontendPath);

let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('handlePageChange') && !content.includes('const [page, setPage]')) {
    // Inject the variables
    const functionMatch = content.match(/(?:function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    if (functionMatch) {
      const index = functionMatch.index + functionMatch[0].length;
      const injection = `\n  const [page, setPage] = React.useState(1);\n  const handlePageChange = (p) => setPage(p);\n  const totalPages = 1;\n`;
      content = content.slice(0, index) + injection + content.slice(index);
      
      if (!content.includes("import React")) {
         if (!content.includes("import * as React")) {
             content = `import React from 'react';\n` + content;
         }
      }

      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed: ${file}`);
      fixedCount++;
    } else {
        console.log(`Could not find function body in: ${file}`);
    }
  }
}

console.log(`Fixed ${fixedCount} files.`);
