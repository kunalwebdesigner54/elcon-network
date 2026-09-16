const fs = require('fs');
const path = require('path');

const filesToFix = [
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Payment/AllWithdrawalRequest/AllWithdrawalRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Payment/ApproveWithdrawalRequest/ApproveWithdrawalRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Payment/PendingWithdrawalRequest/PendingWithdrawalRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Payment/RejectWithdrawalRequest/RejectWithdrawalRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Payment/SucceedWithdrawalRequest/SucceedWithdrawalRequest.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/Members/MemberView/MemberView.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/NetworkReports/DonationReport/DonationReport.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/UserPanel/ePin/EpinFranchiseList/EpinFranchiseList.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/UserPanel/ePin/FranchiseDeliveryReport/FranchiseDeliveryReport.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/UserPanel/Coupon/DiscountCoupon/DiscountCoupon.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/UserPanel/Payment/PaymentRequest/ReceivedHelp.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/UserPanel/Payment/WithdrawalHistory/WithdrawalHistory.jsx',
  'd:/work/nishikant/elcon-network/elcon-frontend/src/Components/Admin/ProductsPackage/ManageCategories/ManageCategories.jsx'
];

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: row.requestId.toLowerCase() -> String(row.requestId || '').toLowerCase()
  content = content.replace(/row\.requestId\.toLowerCase\(\)/g, "String(row.requestId || '').toLowerCase()");
  
  // Pattern 2: (row.memberId || '').toLowerCase() -> String(row.memberId || '').toLowerCase()
  content = content.replace(/\(row\.memberId \|\| ''\)\.toLowerCase\(\)/g, "String(row.memberId || '').toLowerCase()");
  
  // Pattern 3: row.sponsorId.toLowerCase() -> String(row.sponsorId || '').toLowerCase()
  content = content.replace(/row\.sponsorId\.toLowerCase\(\)/g, "String(row.sponsorId || '').toLowerCase()");
  
  // Pattern 4: row.memberId.toLowerCase() -> String(row.memberId || '').toLowerCase()
  content = content.replace(/row\.memberId\.toLowerCase\(\)/g, "String(row.memberId || '').toLowerCase()");
  
  // Pattern 5: row.name.toLowerCase() -> String(row.name || '').toLowerCase()
  content = content.replace(/row\.name\.toLowerCase\(\)/g, "String(row.name || '').toLowerCase()");
  
  // Pattern 6: row.mobile.toLowerCase() -> String(row.mobile || '').toLowerCase()
  content = content.replace(/row\.mobile\.toLowerCase\(\)/g, "String(row.mobile || '').toLowerCase()");
  
  // Pattern 7: row.city.toLowerCase() -> String(row.city || '').toLowerCase()
  content = content.replace(/row\.city\.toLowerCase\(\)/g, "String(row.city || '').toLowerCase()");
  
  // Pattern 8: row.donorMemberId.toLowerCase() -> String(row.donorMemberId || '').toLowerCase()
  content = content.replace(/row\.donorMemberId\.toLowerCase\(\)/g, "String(row.donorMemberId || '').toLowerCase()");
  
  // Pattern 9: row.receiverMemberId.toLowerCase() -> String(row.receiverMemberId || '').toLowerCase()
  content = content.replace(/row\.receiverMemberId\.toLowerCase\(\)/g, "String(row.receiverMemberId || '').toLowerCase()");
  
  // Pattern 10: item.name.toLowerCase() -> String(item.name || '').toLowerCase()
  content = content.replace(/item\.name\.toLowerCase\(\)/g, "String(item.name || '').toLowerCase()");
  
  // Pattern 11: item.upi.toLowerCase() -> String(item.upi || '').toLowerCase()
  content = content.replace(/item\.upi\.toLowerCase\(\)/g, "String(item.upi || '').toLowerCase()");
  
  // Pattern 12: item.city.toLowerCase() -> String(item.city || '').toLowerCase()
  content = content.replace(/item\.city\.toLowerCase\(\)/g, "String(item.city || '').toLowerCase()");
  
  // Pattern 13: item.franchiseId.toLowerCase() -> String(item.franchiseId || '').toLowerCase()
  content = content.replace(/item\.franchiseId\.toLowerCase\(\)/g, "String(item.franchiseId || '').toLowerCase()");
  
  // Pattern 14: status.toLowerCase() -> String(status || '').toLowerCase()
  content = content.replace(/status\.toLowerCase\(\)/g, "String(status || '').toLowerCase()");
  
  // Pattern 15: item.deliveryStatus.toLowerCase() -> String(item.deliveryStatus || '').toLowerCase()
  content = content.replace(/item\.deliveryStatus\.toLowerCase\(\)/g, "String(item.deliveryStatus || '').toLowerCase()");
  
  // Pattern 16: (cat.status || 'ACTIVE').toLowerCase() -> String(cat.status || 'ACTIVE').toLowerCase()
  content = content.replace(/\(cat\.status \|\| 'ACTIVE'\)\.toLowerCase\(\)/g, "String(cat.status || 'ACTIVE').toLowerCase()");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
