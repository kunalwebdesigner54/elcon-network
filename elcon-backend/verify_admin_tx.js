const mongoose = require('mongoose');
const WalletTransaction = require('./models/WalletTransaction');
const User = require('./models/User');

async function verify() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  
  const admin = await User.findOne({role: 'admin'}).lean();
  
  const txs = await WalletTransaction.find({memberId: admin.memberId}).lean();
  
  let cred = 0, deb = 0;
  txs.forEach(t => {
    cred += Number(t.credit);
    deb += Number(t.debit);
    console.log(t.description, 'Credit:', t.credit, 'Debit:', t.debit);
  });
  console.log('Total Cred:', cred, 'Total Deb:', deb);
}

verify().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
