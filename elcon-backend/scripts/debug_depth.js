require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).select('memberId sponsorId role levelDepth name').lean();
  
  const sponsorMap = new Map();
  users.forEach(u => sponsorMap.set(u.memberId, u.sponsorId));
  
  const admin = users.find(u => u.role === 'admin');
  const adminId = admin ? admin.memberId : null;
  console.log(`Root/Company identified as: ${adminId}`);
  
  for (const user of users) {
    let depth = 0;
    let curr = user.memberId;
    const visited = new Set();
    let isInvalid = false;
    let isCircular = false;
    let chain = [];
    
    while (curr) {
      if (curr === adminId) {
        chain.push(adminId);
        break;
      }
      if (visited.has(curr)) {
         isCircular = true;
         chain.push(curr + ' (CIRCULAR)');
         break;
      }
      visited.add(curr);
      chain.push(curr);
      
      const sId = curr === user.memberId ? user.sponsorId : sponsorMap.get(curr);
      
      if (!sId || (sId !== adminId && !sponsorMap.has(sId))) {
        if (curr !== adminId && user.role !== 'admin') isInvalid = true;
        chain.push(sId ? sId + ' (INVALID)' : '(NO SPONSOR)');
        break;
      }
      
      curr = sId;
      depth++;
      if (depth > 100) { isCircular = true; break; }
    }
    
    if (user.role === 'admin') depth = 0;
    
    const dbDepth = user.levelDepth;
    const apiDepth = dbDepth || 0;
    
    if (isInvalid || isCircular || dbDepth === 0) {
      console.log(`ID: ${user.memberId} | SP: ${user.sponsorId} | DB: ${dbDepth} | API: ${apiDepth} | CALC: ${isInvalid?'Invalid':isCircular?'Circular':depth} | Chain: ${chain.join(' -> ')}`);
    }
  }
  process.exit(0);
}
run();
