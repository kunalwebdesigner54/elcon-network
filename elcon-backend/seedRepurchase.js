require('dotenv').config();
const mongoose = require('mongoose');
const RepurchaseIncome = require('./models/RepurchaseIncome');
const User = require('./models/User');

const seedRepurchase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    // Get a few users
    const users = await User.find().limit(5);
    
    if (users.length < 2) {
      console.log('Not enough users to create fake data');
      process.exit(1);
    }
    
    const fakeData = [
      {
        recipientMemberId: users[0].memberId,
        purchasingMemberId: users[1].memberId,
        purchasingMemberName: users[1].name,
        level: 1,
        physicalDepth: 1,
        amount: 25,
        orderNo: 'ORD1234567890',
        status: 'CREDITED',
        skippedMembers: []
      },
      {
        recipientMemberId: users[0].memberId,
        purchasingMemberId: users[2].memberId,
        purchasingMemberName: users[2].name,
        level: 2,
        physicalDepth: 2,
        amount: 25,
        orderNo: 'ORD0987654321',
        status: 'CREDITED',
        skippedMembers: []
      },
      {
        recipientMemberId: users[1].memberId,
        purchasingMemberId: users[3].memberId,
        purchasingMemberName: users[3].name,
        level: 1,
        physicalDepth: 1,
        amount: 50,
        orderNo: 'ORD5555555555',
        status: 'CREDITED',
        skippedMembers: [ { memberId: 'IHH12345', reason: 'INACTIVE' } ]
      }
    ];

    await RepurchaseIncome.deleteMany({});
    await RepurchaseIncome.insertMany(fakeData);
    console.log('Dummy Repurchase Income data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedRepurchase();
