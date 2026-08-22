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
  
  let correct = 0;
  let corrected = 0;
  let negative = 0;
  let missing = 0;
  let invalid = 0;
  let circular = 0;
  let mismatch = 0;
  
  const report = [];
  
  users.forEach(user => {
    let curr = user.memberId;
    const chain = [];
    const visited = new Set();
    let depth = 0;
    
    let isMissing = false;
    let isInvalid = false;
    let isCircular = false;
    
    while(curr) {
      if (curr === adminId) {
        chain.push(adminId + ' (Root)');
        break;
      }
      if (visited.has(curr)) {
        isCircular = true;
        chain.push(curr + ' (Circular)');
        break;
      }
      visited.add(curr);
      chain.push(curr);
      
      const sId = (curr === user.memberId) ? user.sponsorId : sponsorMap.get(curr);
      if (!sId) {
        isMissing = true;
        chain.push('MISSING SPONSOR');
        break;
      }
      if (sId !== adminId && !sponsorMap.has(sId)) {
        isInvalid = true;
        chain.push(sId + ' (INVALID/NOT FOUND)');
        break;
      }
      curr = sId;
      depth++;
      if (depth > 1000) { isCircular = true; break; }
    }
    
    if (user.role === 'admin') depth = 0;
    
    const dbDepth = user.levelDepth;
    
    if (dbDepth < 0) negative++;
    if (isMissing) missing++;
    if (isInvalid) invalid++;
    if (isCircular) circular++;
    
    let status = '';
    let finalDepth = depth;
    
    if (isMissing || isInvalid || isCircular) {
      status = 'INVALID CHAIN';
      finalDepth = -1;
    } else {
      status = 'VALID CHAIN';
    }
    
    if (dbDepth === finalDepth) {
      correct++;
    } else {
      mismatch++;
      status += ' (DB MISMATCH)';
    }
    
    report.push({
      memberId: user.memberId,
      sponsorId: user.sponsorId,
      chain: chain.join(' → '),
      calcDepth: finalDepth,
      dbDepth: dbDepth,
      status: status
    });
  });
  
  console.log(`\nFINAL REPORT:`);
  console.log(`Total Members Checked: ${users.length}`);
  console.log(`Correct: ${correct}`);
  console.log(`Corrected: ${corrected}`);
  console.log(`Negative Depth Records: ${negative}`);
  console.log(`Missing Sponsor: ${missing}`);
  console.log(`Invalid Sponsor: ${invalid}`);
  console.log(`Circular Sponsor Chain: ${circular}`);
  console.log(`Remaining Mismatch: ${mismatch}\n`);
  
  console.log('Member ID | Sponsor ID | Calculated Depth | Stored Depth | Status | Full Sponsor Chain');
  console.log('-'.repeat(150));
  report.slice(0, 20).forEach(r => {
    console.log(`${r.memberId} | ${r.sponsorId} | ${r.calcDepth} | ${r.dbDepth} | ${r.status} | ${r.chain}`);
  });
  
  process.exit(0);
}
run();
