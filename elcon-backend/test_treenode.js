const mongoose = require('mongoose');
const User = require('./models/User');
const { getTreeNode } = require('./controllers/membersController');
require('dotenv').config();

async function testApi() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB connected');

  // Let's test with the Admin
  const adminUser = await User.findOne({ role: 'admin' }).lean();
  console.log('Admin User:', adminUser.memberId, adminUser.name);

  // Mock req and res
  const req = {
    user: { role: 'admin', memberId: adminUser.memberId, id: adminUser._id },
    query: {}
  };
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Status:', this.statusCode);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  };

  await getTreeNode(req, res);
  await mongoose.disconnect();
}

testApi().catch(console.error);
