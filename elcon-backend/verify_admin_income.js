const mongoose = require('mongoose');
const LevelIncome = require('./models/LevelIncome');
const RepurchaseIncome = require('./models/RepurchaseIncome');
const User = require('./models/User');

async function verify() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  
  const admin = await User.findOne({role: 'admin'}).lean();
  console.log('Admin:', admin.memberId, 'Wallet:', admin.walletBalance);

  const levelIncomes = await LevelIncome.find({recipientMemberId: admin.memberId}).lean();
  let adminLevelSum = 0;
  levelIncomes.forEach(i => adminLevelSum += Number(i.amount));
  
  const repIncomes = await RepurchaseIncome.find({recipientMemberId: admin.memberId}).lean();
  let adminRepSum = 0;
  repIncomes.forEach(i => adminRepSum += Number(i.amount));

  console.log('Admin Level Income Gross:', adminLevelSum);
  console.log('Admin Repurchase Income Gross:', adminRepSum);
}

verify().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
