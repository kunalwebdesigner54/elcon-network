require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");
  
  // Use select to only fetch what we need (prevents MTU network drop issues on large datasets)
  const users = await User.find({}).select('_id memberId sponsorId role levelDepth').lean();
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
  const bulkOps = [];
  
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
      if (depth > 1000) {
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
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { levelDepth: depth } }
        }
      });
      discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: depth, status: 'Corrected' });
    } else {
      already++;
      if (already <= 5) discrepancies.push({ memberId: user.memberId, sponsorId: user.sponsorId, stored: user.levelDepth, calc: depth, status: 'Already Correct' });
    }
  }
  
  if (bulkOps.length > 0) {
    console.log(`Writing ${bulkOps.length} updates to database via bulkWrite...`);
    await User.bulkWrite(bulkOps);
    console.log('Database updated.');
  }
  
  console.log('\n--- FINAL VERIFICATION REPORT ---');
  console.log(`Total Members Checked: ${users.length}`);
  console.log(`Already Correct: ${already}`);
  console.log(`Corrected: ${corrected}`);
  console.log(`Invalid/Missing Sponsor: ${invalid}`);
  console.log(`Circular Chains: ${circular}`);
  
  console.log('\n--- SAMPLE RECORDS ---');
  console.log('Member ID | Sponsor ID | Calculated Physical Depth | Stored Depth | Status');
  console.log('-'.repeat(80));
  
  discrepancies.slice(0, 20).forEach(d => {
    console.log(`${d.memberId} | ${d.sponsorId} | ${d.calc} | ${d.stored || 0} | ${d.status}`);
  });
  
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
