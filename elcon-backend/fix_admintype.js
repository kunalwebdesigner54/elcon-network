const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority').then(async () => {
  const User = require('./models/User');
  
  // Unset adminType for all users where role is 'user'
  const result = await User.updateMany(
    { role: 'user', adminType: { $exists: true } },
    { $unset: { adminType: 1 } }
  );
  
  console.log('Fixed users:', result.modifiedCount);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
