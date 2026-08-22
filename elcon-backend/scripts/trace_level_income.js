require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const LevelIncome = require('../models/LevelIncome');
const User = require('../models/User');

async function trace() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Identify one real NEW transaction
    const latestTransaction = await LevelIncome.findOne().sort({ createdAt: -1 });
    const oldestTransaction = await LevelIncome.findOne().sort({ createdAt: 1 });

    console.log('\n--- LATEST TRANSACTION (NEW) ---');
    console.log(JSON.stringify(latestTransaction, null, 2));

    console.log('\n--- OLDEST TRANSACTION (OLD) ---');
    console.log(JSON.stringify(oldestTransaction, null, 2));

    // Also get the raw document to see all fields (even those not in schema)
    const rawLatest = await mongoose.connection.db.collection('levelincomes').findOne({ _id: latestTransaction._id });
    console.log('\n--- RAW LATEST FROM DB ---');
    console.log(JSON.stringify(rawLatest, null, 2));

    // Step 5: Backend Query Check (Simulation)
    const query = {};
    const totalCount = await LevelIncome.countDocuments(query);
    const records = await LevelIncome.find(query).sort({ createdAt: -1 }).skip(0).limit(10).lean();

    console.log(`\n--- BACKEND QUERY RESULT ---`);
    console.log(`Total count: ${totalCount}`);
    console.log(`Records fetched in page 1: ${records.length}`);
    if (records.length > 0) {
      console.log(`Is latest transaction in page 1? ${records.some(r => String(r._id) === String(latestTransaction._id))}`);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
  }
}

trace();
