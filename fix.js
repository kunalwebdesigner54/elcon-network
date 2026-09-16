const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'elcon-frontend/src/Components/Admin/Members/AllMemberPerformance/AllMemberPerformance.jsx');
let content1 = fs.readFileSync(file1, 'utf8');

content1 = content1.replace(
  `      const byMemberId = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.memberName || row.memberName.toLowerCase().includes(filters.memberName.toLowerCase());
      const byStatus = !filters.status || row.status === filters.status;
      const byLevelDepth = !filters.levelDepth || String(row.levelDepth) === filters.levelDepth;`,
  `      const byMemberId = !filters.memberId || String(row.memberId || '').toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.memberName || String(row.memberName || '').toLowerCase().includes(filters.memberName.toLowerCase());
      const byStatus = !filters.status || row.status === filters.status;
      const byLevelDepth = !filters.levelDepth || String(row.levelDepth) === filters.levelDepth;`
);

content1 = content1.replace(
  `const joinDateValue = row.joinDateRaw ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';`,
  `const joinDateValue = row.joinDateRaw && !isNaN(new Date(row.joinDateRaw)) ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';`
);

fs.writeFileSync(file1, content1);

const file2 = path.join(__dirname, 'elcon-frontend/src/Components/Admin/Members/MembersLocation/MembersLocation.jsx');
let content2 = fs.readFileSync(file2, 'utf8');

content2 = content2.replace(
  `      const byMember = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || row.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
      const byState = !filters.state || row.state.toLowerCase().includes(filters.state.toLowerCase());
      const byCity = !filters.city || row.city.toLowerCase().includes(filters.city.toLowerCase());`,
  `      const byMember = !filters.memberId || String(row.memberId || '').toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || String(row.name || '').toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || String(row.mobile || '').toLowerCase().includes(filters.mobile.toLowerCase());
      const byState = !filters.state || String(row.state || '').toLowerCase().includes(filters.state.toLowerCase());
      const byCity = !filters.city || String(row.city || '').toLowerCase().includes(filters.city.toLowerCase());`
);

content2 = content2.replace(
  `const joinDateValue = row.joinDateRaw ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';`,
  `const joinDateValue = row.joinDateRaw && !isNaN(new Date(row.joinDateRaw)) ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';`
);

fs.writeFileSync(file2, content2);
console.log('Fixed useMemo string conversions');
