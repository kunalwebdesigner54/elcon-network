const mongoose = require('mongoose');
require('dotenv').config();
const uplineEngine = require('./services/uplineEngine');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster.mongodb.net/test'); // Adjust if needed
  const start = Date.now();
  const res = await uplineEngine.getLogicalUplines('EL91392448', 10, 'DONATION', 1);
  console.log('Time taken: ' + (Date.now() - start) + 'ms');
  console.log('Receivers: ' + res.receivers.length);
  process.exit(0);
}

run().catch(console.error);
