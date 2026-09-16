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
  let originalContent = content;
  
  // Find component function definition
  const functionMatch = content.match(/(?:function\s+([A-Z]\w*)\s*\([^)]*\)\s*\{|const\s+([A-Z]\w*)\s*=\s*\([^)]*\)\s*=>\s*\{)/);
  if (!functionMatch) continue;

  const index = functionMatch.index + functionMatch[0].length;
  
  // Inject [page, setPage] and handlePageChange if missing
  if (content.includes('handlePageChange') && !content.match(/const\s+\[page,\s*setPage\]/)) {
    const injection = `\n  const [page, setPage] = React.useState(1);\n  const handlePageChange = (p) => setPage(p);\n`;
    content = content.slice(0, index) + injection + content.slice(index);
    
    if (!content.includes("import React") && !content.includes("import * as React")) {
        content = `import React from 'react';\n` + content;
    }
  }

  // Inject handlePageChange if missing but [page, setPage] exists
  if (content.includes('handlePageChange(') && !content.includes('handlePageChange =') && content.match(/const\s+\[page,\s*setPage\]/)) {
    const newMatch = content.match(/(?:function\s+([A-Z]\w*)\s*\([^)]*\)\s*\{|const\s+([A-Z]\w*)\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    const newIndex = newMatch.index + newMatch[0].length;
    let injection = `\n  const handlePageChange = (p) => typeof setPage === 'function' ? setPage(p) : null;\n`;
    content = content.slice(0, newIndex) + injection + content.slice(newIndex);
  }

  // Inject totalPages if missing
  if (content.includes('totalPages') && !content.match(/totalPages\s*=/) && !content.match(/const\s+\[totalPages,\s*setTotalPages\]/)) {
    const newMatch = content.match(/(?:function\s+([A-Z]\w*)\s*\([^)]*\)\s*\{|const\s+([A-Z]\w*)\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    const newIndex = newMatch.index + newMatch[0].length;
    let injection = `\n  const totalPages = 1;\n`;
    content = content.slice(0, newIndex) + injection + content.slice(newIndex);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${file}`);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files.`);
