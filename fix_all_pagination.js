const fs = require('fs');
const path = require('path');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix visibleRows and totalPages logic
  content = content.replace(
    /const visibleRows = filteredRows\.slice\(0, Number\(pageSize\)\);/g,
    `const totalPages = Math.ceil(filteredRows.length / Number(pageSize)) || 1;
  const visibleRows = filteredRows.slice((page - 1) * Number(pageSize), page * Number(pageSize));`
  );

  // Remove the undefined pagination variable
  content = content.replace(
    /const totalPages = pagination\?\.pages \|\| 1;/g,
    `// totalPages calculated above`
  );

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
};

const baseDir = path.join(__dirname, 'elcon-frontend/src/Components/Admin/Members');
const files = [
  'MemberView/MemberView.jsx',
  'MemberInformation/MemberInformation.jsx',
  'MemberBlockList/MemberBlockList.jsx',
  'MemberAlertList/MemberAlertList.jsx',
  'KYCRequest/KYCRequest.jsx'
];

files.forEach(f => fixFile(path.join(baseDir, f)));
