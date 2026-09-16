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
  let changed = false;
  
  if (content.includes('handlePageChange(') && !content.includes('handlePageChange =')) {
    // Inject handlePageChange
    const functionMatch = content.match(/(?:function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    if (functionMatch) {
      const index = functionMatch.index + functionMatch[0].length;
      let injection = `\n  const handlePageChange = (p) => typeof setPage === 'function' ? setPage(p) : null;\n`;
      content = content.slice(0, index) + injection + content.slice(index);
      changed = true;
    }
  }

  if (content.includes('totalPages') && !content.includes('totalPages =')) {
    // Inject totalPages
    const functionMatch = content.match(/(?:function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    if (functionMatch) {
      const index = functionMatch.index + functionMatch[0].length;
      let injection = `\n  const totalPages = 1;\n`;
      content = content.slice(0, index) + injection + content.slice(index);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed missing variables in: ${file}`);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files.`);
