const fs = require('fs');
const path = require('path');

const controllers = [
  'couponsController.js',
  'depositsController.js',
  'donationsController.js',
  'epinsController.js',
  'levelIncomeController.js',
  'membersController.js',
  'newsPopupController.js',
  'transactionsController.js',
  'withdrawalsController.js'
];

const backendDir = path.join(__dirname, 'elcon-backend', 'controllers');

controllers.forEach(file => {
  const filePath = path.join(backendDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern 1: standard formatDate
  const pattern1 = /const formatDate = \(value\) => \{[\s\S]*?return date\.toLocaleDateString\('en-GB'\);\s*\};/m;
  // Pattern 2: levelIncomeController formatDate
  const pattern2 = /const formatDate = \(value\) => \{[\s\S]*?return `\$\{dd\}\/\$\{mm\}\/\$\{yyyy\} \$\{strTime\}`;\s*\};/m;
  // Pattern 3: donationsController might have something else
  
  // Try replacing pattern 1
  if (pattern1.test(content)) {
    content = content.replace(pattern1, "const { formatDate, formatDateOnly } = require('../utils/dateFormatter');");
  } else if (pattern2.test(content)) {
    content = content.replace(pattern2, "const { formatDate, formatDateOnly } = require('../utils/dateFormatter');");
  } else {
    // Manually find the function block
    const funcStart = content.indexOf('const formatDate = (value) => {');
    if (funcStart !== -1) {
      let braceCount = 0;
      let funcEnd = -1;
      for (let i = funcStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            funcEnd = i;
            break;
          }
        }
      }
      if (funcEnd !== -1) {
        // Also grab the trailing semicolon if it exists
        if (content[funcEnd + 1] === ';') funcEnd++;
        
        const funcBlock = content.substring(funcStart, funcEnd + 1);
        content = content.replace(funcBlock, "const { formatDate, formatDateOnly } = require('../utils/dateFormatter');");
      }
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Updated:', file);
});
