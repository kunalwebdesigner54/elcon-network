require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");
  
  const users = await User.find({}).select('_id memberId sponsorId role levelDepth name').lean();
  console.log(`Fetched ${users.length} users.`);
  
  const sponsorMap = new Map();
  users.forEach(u => sponsorMap.set(u.memberId, u.sponsorId));
  
  const admin = users.find(u => u.role === 'admin');
  const adminId = admin ? admin.memberId : null;
  console.log(`Root/Company identified as: ${adminId}`);
  
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
      if (depth > 1000) {
        isCircular = true;
        break;
      }
    }
    
    if (user.role === 'admin') depth = 0;
    
    // For invalid/circular chains, we assign depth -1 so they don't fallback to 0 (admin level)
    const finalDepthToSave = (isInvalid || isCircular) ? -1 : depth;
    const dbDepth = user.levelDepth;
    
    let status = 'Correct';
    if (dbDepth !== finalDepthToSave) {
       status = 'Needs Correction';
       corrected++;
       bulkOps.push({
         updateOne: {
           filter: { _id: user._id },
           update: { $set: { levelDepth: finalDepthToSave } }
         }
       });
       discrepancies.push({ 
           memberId: user.memberId, 
           sponsorId: user.sponsorId, 
           calc: finalDepthToSave,
           stored: dbDepth, 
           status: isInvalid ? 'Corrected (Was Invalid)' : (isCircular ? 'Corrected (Was Circular)' : 'Corrected'),
           chain: chain.join(' -> ')
       });
    } else {
       already++;
       if (isInvalid) invalid++;
       if (isCircular) circular++;
       if (already <= 5) discrepancies.push({ 
           memberId: user.memberId, 
           sponsorId: user.sponsorId, 
           calc: finalDepthToSave, 
           stored: dbDepth, 
           status: 'Already Correct',
           chain: chain.join(' -> ')
       });
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
  console.log('Member ID | Sponsor ID | Calculated Physical Depth | Stored Depth | Status | Chain');
  console.log('-'.repeat(120));
  
  discrepancies.slice(0, 20).forEach(d => {
    console.log(`${d.memberId} | ${d.sponsorId} | ${d.calc} | ${d.stored !== undefined ? d.stored : 'undefined'} | ${d.status} | ${d.chain}`);
  });
  
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
