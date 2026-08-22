require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB!");

  const users = await User.find({}).lean();
  console.log(`Found ${users.length} users in DB.`);
  
  const sponsorMap = new Map();
  users.forEach(u => {
    sponsorMap.set(u.memberId, u.sponsorId);
  });

  const adminUser = users.find(u => u.role === 'admin');
  const adminMemberId = adminUser ? adminUser.memberId : null;
  console.log(`Admin Member ID is: ${adminMemberId}`);

  let totalMembers = users.length;
  let alreadyCorrect = 0;
  let corrected = 0;
  let invalidMissingSponsor = 0;
  let circularChains = 0;

  const discrepancies = [];

  for (const user of users) {
    let depth = 0;
    let curr = user.memberId;
    const visited = new Set();
    let isInvalid = false;
    let isCircular = false;

    while (curr) {
      if (curr === adminMemberId) break;
      if (visited.has(curr)) {
        isCircular = true;
        break;
      }
      visited.add(curr);
      
      const sId = sponsorMap.get(curr);
      
      if (!sId) {
        if (curr !== adminMemberId && user.role !== 'admin') isInvalid = true;
        break;
      }

      if (sId !== adminMemberId && !sponsorMap.has(sId)) {
        isInvalid = true;
        break;
      }

      curr = sId;
      depth++;
      if (depth > 1000) { isCircular = true; break; }
    }

    if (user.role === 'admin') depth = 0;

    const storedDepth = user.levelDepth || 0;
    let status = 'Correct';
    
    if (isCircular) {
       status = 'Circular Chain';
       circularChains++;
    } else if (isInvalid && user.role !== 'admin') {
       status = 'Invalid/Missing Sponsor';
       invalidMissingSponsor++;
    } else if (storedDepth !== depth) {
       status = 'Needs Correction';
       corrected++;
       await User.updateOne({ _id: user._id }, { $set: { levelDepth: depth } });
    } else {
       alreadyCorrect++;
    }

    if (status !== 'Correct' || discrepancies.length < 5) {
       discrepancies.push({
           memberId: user.memberId,
           sponsorId: user.sponsorId,
           calculatedDepth: isCircular || isInvalid ? 'N/A' : depth,
           storedDepth,
           status
       });
    }
  }

  console.log('\n--- FINAL VERIFICATION REPORT ---');
  console.log(`Total Members Checked: ${totalMembers}`);
  console.log(`Already Correct: ${alreadyCorrect}`);
  console.log(`Corrected: ${corrected}`);
  console.log(`Invalid/Missing Sponsor: ${invalidMissingSponsor}`);
  console.log(`Circular Chains: ${circularChains}`);
  
  console.log('\n--- SAMPLE RECORDS ---');
  console.log('Member ID | Sponsor ID | Calculated Physical Depth | Stored Depth | Status');
  console.log('-'.repeat(80));
  
  const samples = discrepancies.slice(0, 20);
  samples.forEach(s => {
    console.log(`${s.memberId} | ${s.sponsorId} | ${s.calculatedDepth} | ${s.storedDepth} | ${s.status}`);
  });

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
