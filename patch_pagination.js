const fs = require('fs');
const files = [
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MemberView/MemberView.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MembersLocation/MembersLocation.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MemberInformation/MemberInformation.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MemberBlockList/MemberBlockList.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MemberAlertList/MemberAlertList.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/KYCRequest/KYCRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/AllMemberPerformance/AllMemberPerformance.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const totalPages = pagination.pages || 1;')) {
    console.log(`Skipping ${file}, already patched.`);
    return;
  }
  
  const injectCode = `
  const totalPages = pagination?.pages || 1;
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (`;

  content = content.replace('  return (', injectCode);
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
});
