require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const migrateLevelDepth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Fetching all users...');
    const users = await User.find({}).select('memberId sponsorId levelDepth').lean();
    console.log(`Found ${users.length} users.`);

    // Build structural tree
    const childrenBySponsor = new Map();
    const userMap = new Map();

    users.forEach(user => {
      userMap.set(user.memberId, user);
      const sponsorKey = String(user.sponsorId || '').trim();
      if (!childrenBySponsor.has(sponsorKey)) {
        childrenBySponsor.set(sponsorKey, []);
      }
      childrenBySponsor.get(sponsorKey).push(user.memberId);
    });

    const depthUpdates = new Map();
    const visited = new Set();

    // Calculate depth recursively from roots
    const calculateDepth = (memberId, currentDepth) => {
      if (visited.has(memberId)) return; // prevent circular infinite loop
      visited.add(memberId);

      const user = userMap.get(memberId);
      if (user && user.levelDepth !== currentDepth) {
        depthUpdates.set(memberId, currentDepth);
      }

      const children = childrenBySponsor.get(memberId) || [];
      children.forEach(childId => calculateDepth(childId, currentDepth + 1));
    };

    // Find roots (users with no sponsor or sponsor doesn't exist)
    const roots = [];
    users.forEach(user => {
      const sponsorKey = String(user.sponsorId || '').trim();
      if (!sponsorKey || !userMap.has(sponsorKey)) {
        roots.push(user.memberId);
      }
    });

    console.log(`Found ${roots.length} root members. Starting depth calculation...`);
    
    roots.forEach(rootId => calculateDepth(rootId, 1));

    // Handle circular loops that weren't reached from roots
    users.forEach(user => {
      if (!visited.has(user.memberId)) {
        // Just set depth to 1 for unreachable circular nodes as fallback
        if (user.levelDepth !== 1) {
          depthUpdates.set(user.memberId, 1);
        }
      }
    });

    console.log(`Calculated updates. ${depthUpdates.size} users need levelDepth correction.`);

    if (depthUpdates.size > 0) {
      console.log('Preparing bulk write...');
      const bulkOps = [];
      
      depthUpdates.forEach((depth, memberId) => {
        bulkOps.push({
          updateOne: {
            filter: { memberId: memberId },
            update: { $set: { levelDepth: depth } }
          }
        });
      });

      // Execute in batches to prevent out of memory
      const batchSize = 1000;
      for (let i = 0; i < bulkOps.length; i += batchSize) {
        const batch = bulkOps.slice(i, i + batchSize);
        await User.bulkWrite(batch);
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
      }
      console.log('Level depth migration completed successfully.');
    } else {
      console.log('No updates required. Level depths are already correct.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateLevelDepth();
