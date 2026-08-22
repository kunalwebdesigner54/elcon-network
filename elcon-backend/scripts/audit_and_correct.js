require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");
  
  const users = await User.find({}).lean();
  console.log(`Fetched ${users.length} users.`);
  
  const sponsorMap = new Map();
  users.forEach(u => sponsorMap.set(u.memberId, u.sponsorId));
  
  const admin = users.find(u => u.role === 'admin');
  const adminId = admin ? admin.memberId : null;
  
  let corrected = 0;
  let already = 0;
  let invalid = 0;
  let circular = 0;
  
  const discrepancies = [];
  
  console.log("Auditing depths...");
  
  let i = 0;
  for (const user of users) {
    let depth = 0;
    let curr = user.memberId;
    const visited = new Set();
    let isInvalid = false;
    let isCircular = false;
    
    while (curr) {
      if (curr === adminId) break;
      if (visited.has(curr)) {
         isCircular = true;
         break;
      }
      visited.add(curr);
      
      const sId = curr === user.memberId ? user.sponsorId : sponsorMap.get(curr);
      
      if (!sId || (sId !== adminId && !sponsorMap.has(sId))) {
        if (curr !== adminId && user.role !== 'admin') isInvalid = true;
        break;
      }
      
      curr = sId;
      depth++;
      if (depth > 100) {
        isCircular = true;
        break;
      }
    }
    
    if (user.role === 'admin') depth = 0;
    
    if (isCircular) {
      circular++;
      discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: 'N/A', status: 'Circular Chain' });
    } else if (isInvalid) {
      invalid++;
      discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: 'N/A', status: 'Invalid Sponsor' });
    } else if (user.levelDepth !== depth) {
      corrected++;
      await User.updateOne({ _id: user._id }, { $set: { levelDepth: depth } });
      discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: depth, status: 'Corrected' });
    } else {
      already++;
      if (already <= 5) discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: depth, status: 'Already Correct' });
    }
    
    i++;
    if (i % 10 === 0) console.log(`Processed ${i} / ${users.length}`);
  }
  
  console.log('\nTotal Members:', users.length);
  console.log('Already Correct:', already);
  console.log('Corrected:', corrected);
  console.log('Invalid/Missing Sponsor:', invalid);
  console.log('Circular Chains:', circular);
  
  console.log('\n--- SAMPLES ---');
  discrepancies.slice(0, 15).forEach(d => console.log(`${d.memberId} | Sponsor: ${d.sponsorId} | Calc Depth: ${d.calc} | Stored: ${d.stored || 0} | Status: ${d.status}`));
  
  process.exit(0);
}
run();
