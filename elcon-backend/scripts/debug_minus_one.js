require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = await User.find({}).select('memberId sponsorId name levelDepth role').lean();
  
  const sponsorMap = new Map();
  users.forEach(u => sponsorMap.set(u.memberId, u.sponsorId));
  
  const admin = users.find(u => u.role === 'admin');
  const adminId = admin ? admin.memberId : null;
  
  const minusOneUsers = users.filter(u => u.levelDepth === -1);
  console.log(`\nFound ${minusOneUsers.length} users with levelDepth -1.`);
  
  console.log("\n--- -1 MEMBERS FULL SPONSOR CHAIN ---");
  minusOneUsers.forEach(user => {
    let curr = user.memberId;
    const chain = [];
    const visited = new Set();
    
    while(curr) {
      if (curr === adminId) {
        chain.push(adminId + ' (Root)');
        break;
      }
      if (visited.has(curr)) {
        chain.push(curr + ' (Circular)');
        break;
      }
      visited.add(curr);
      chain.push(curr);
      
      const sId = (curr === user.memberId) ? user.sponsorId : sponsorMap.get(curr);
      if (!sId) {
        chain.push('MISSING SPONSOR');
        break;
      }
      if (sId !== adminId && !sponsorMap.has(sId)) {
        chain.push(sId + ' (INVALID/NOT FOUND)');
        break;
      }
      curr = sId;
    }
    
    console.log(`\nMember ID: ${user.memberId}`);
    console.log(chain.map((c, i) => i === 0 ? c : `→ ${c}`).join('\n'));
  });
  
  process.exit(0);
}
run();
