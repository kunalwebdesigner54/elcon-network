const fs = require('fs');
const path = require('path');

const applyReplacements = (filePath, replacements, importStatement) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  if (!content.includes(importStatement)) {
    // Add import statement at the top (after other imports)
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIndex);
      content = content.substring(0, lineEnd + 1) + importStatement + '\n' + content.substring(lineEnd + 1);
    } else {
      content = importStatement + '\n' + content;
    }
  }

  replacements.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  } else {
    console.log('No changes needed for', filePath);
  }
};

const basePath = path.join(__dirname, 'elcon-frontend', 'src');

// 1. CouponReport.jsx
applyReplacements(
  path.join(basePath, 'Components', 'Admin', 'Coupon', 'CouponReport', 'CouponReport.jsx'),
  [
    { search: /new Date\(coupon\.usedDate\)\.toLocaleDateString\('en-IN'\)/g, replace: 'formatDate(coupon.usedDate)' },
    { search: /new Date\(coupon\.expiryDate\)\.toLocaleDateString\('en-IN'\)/g, replace: 'formatDate(coupon.expiryDate)' }
  ],
  "import { formatDate } from '../../../../../utils/dateFormatter';"
);

// 2. DiscountCoupon.jsx
applyReplacements(
  path.join(basePath, 'Components', 'UserPanel', 'Coupon', 'DiscountCoupon', 'DiscountCoupon.jsx'),
  [
    { search: /new Date\(coupon\.createdAt\)\.toLocaleDateString\('en-IN'\)/g, replace: 'formatDate(coupon.createdAt)' },
    { search: /new Date\(coupon\.expiryDate\)\.toLocaleDateString\('en-IN'\)/g, replace: 'formatDate(coupon.expiryDate)' },
    { search: /new Date\(coupon\.usedDate\)\.toLocaleDateString\('en-IN'\)/g, replace: 'formatDate(coupon.usedDate)' }
  ],
  "import { formatDate } from '../../../../../utils/dateFormatter';"
);

// 3. GivenHelp.jsx
applyReplacements(
  path.join(basePath, 'Components', 'UserPanel', 'Donations', 'GivenHelp.jsx'),
  [
    { search: "new Date().toLocaleDateString('en-GB').replace(/\\//g, '-')", replace: 'formatDate(new Date())' }
  ],
  "import { formatDate } from '../../../../utils/dateFormatter';"
);

// 4. ShowProfile.jsx
const showProfilePath = path.join(basePath, 'Components', 'UserPanel', 'Profile', 'MyProfile', 'ShowProfile.jsx');
let spContent = fs.readFileSync(showProfilePath, 'utf8');
if (!spContent.includes('formatDate from')) {
  const funcPattern = /const formatDate = \(date\) => \{[\s\S]*?return new Date\(date\)\.toLocaleDateString\('en-IN', \{[\s\S]*?\}\);\s*\};/m;
  spContent = spContent.replace(funcPattern, ''); // Remove the local formatDate function
  spContent = "import { formatDate } from '../../../../../utils/dateFormatter';\n" + spContent;
  fs.writeFileSync(showProfilePath, spContent);
  console.log('Updated ShowProfile.jsx');
}

// 5. UserDashboard.jsx
applyReplacements(
  path.join(basePath, 'Components', 'UserPanel', 'UserDashboard', 'UserDashboard.jsx'),
  [
    { search: /new Date\(memberInfo\.registeredAt\)\.toLocaleDateString\(\)/g, replace: 'formatDate(memberInfo.registeredAt)' }
  ],
  "import { formatDate } from '../../../../utils/dateFormatter';"
);

// 6. MyTeam.jsx
const myTeamPath = path.join(basePath, 'Components', 'UserPanel', 'Team', 'MyTeam', 'MyTeam.jsx');
let myTeamContent = fs.readFileSync(myTeamPath, 'utf8');
const myTeamJoinDatePattern = /child\.joinDateRaw \? \(\(\) => \{[\s\S]*?\}\)\(\) : \(child\.joinDate \|\| '--'\)/;
if (myTeamJoinDatePattern.test(myTeamContent)) {
  myTeamContent = myTeamContent.replace(myTeamJoinDatePattern, "child.joinDateRaw ? formatDate(child.joinDateRaw) : (child.joinDate || '---')");
  // wait, the fallback is '---'
}
// Try a broader regex since exact match is tricky with formatting
const myTeamJoinDatePatternBroad = /child\.joinDateRaw \? \(\(\) => \{[\s\S]*?\}\)\(\) : \(child\.joinDate \|\| '--(?:-)?'\)/;
if (myTeamJoinDatePatternBroad.test(myTeamContent)) {
  myTeamContent = myTeamContent.replace(myTeamJoinDatePatternBroad, "child.joinDateRaw ? formatDate(child.joinDateRaw) : (child.joinDate || '---')");
  myTeamContent = "import { formatDate } from '../../../../../utils/dateFormatter';\n" + myTeamContent;
  fs.writeFileSync(myTeamPath, myTeamContent);
  console.log('Updated MyTeam.jsx');
}

// 7. DonationReport.jsx
const donationReportPath = path.join(basePath, 'Components', 'Admin', 'NetworkReports', 'DonationReport', 'DonationReport.jsx');
let drContent = fs.readFileSync(donationReportPath, 'utf8');
const drFormatFuncPattern = /const formatDate = \(dateStr\) => \{[\s\S]*?return `\$\{day\}-\$\{month\}-\$\{year\}`;[\s\S]*?\};/m;
if (drFormatFuncPattern.test(drContent)) {
  drContent = drContent.replace(drFormatFuncPattern, '');
  drContent = "import { formatDate } from '../../../../../utils/dateFormatter';\n" + drContent;
  fs.writeFileSync(donationReportPath, drContent);
  console.log('Updated DonationReport.jsx');
}

// 8. AllMembersList.jsx
const allMembersPath = path.join(basePath, 'Components', 'Admin', 'Members', 'AllMembersList', 'AllMembersList.jsx');
let amContent = fs.readFileSync(allMembersPath, 'utf8');
const amFormatFuncPattern = /const formatDate = \(dateStr\) => \{[\s\S]*?return `\$\{day\}-\$\{month\}-\$\{year\}`;[\s\S]*?\};/m;
if (amFormatFuncPattern.test(amContent)) {
  amContent = amContent.replace(amFormatFuncPattern, '');
  amContent = "import { formatDate } from '../../../../../utils/dateFormatter';\n" + amContent;
  fs.writeFileSync(allMembersPath, amContent);
  console.log('Updated AllMembersList.jsx');
}

