const fs = require('fs');
const path = require('path');

const fixImports = [
  { file: 'src/Components/UserPanel/Donations/GivenHelp.jsx', wrong: '../../../../utils/dateFormatter', correct: '../../../utils/dateFormatter' },
  { file: 'src/Components/Admin/NetworkReports/DonationReport/DonationReport.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
  { file: 'src/Components/UserPanel/Coupon/DiscountCoupon/DiscountCoupon.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
  { file: 'src/Components/Admin/Coupon/CouponReport/CouponReport.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
  { file: 'src/Components/UserPanel/UserDashboard/UserDashboard.jsx', wrong: '../../../../utils/dateFormatter', correct: '../../../utils/dateFormatter' },
  { file: 'src/Components/UserPanel/Team/MyTeam/MyTeam.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
  { file: 'src/Components/UserPanel/Profile/MyProfile/ShowProfile.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
  { file: 'src/Components/Admin/Members/AllMembersList/AllMembersList.jsx', wrong: '../../../../../utils/dateFormatter', correct: '../../../../utils/dateFormatter' },
];

fixImports.forEach(({ file, wrong, correct }) => {
  const fullPath = path.join(__dirname, 'elcon-frontend', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(wrong, correct);
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', file);
  }
});
