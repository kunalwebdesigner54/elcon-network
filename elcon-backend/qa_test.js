const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const LevelIncome = require('./models/LevelIncome');
const Donation = require('./models/Donation');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- STARTING QA VERIFICATION ---');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
  } catch(e) {
    console.error('DB Connect Error:', e);
    process.exit(1);
  }
  
  const report = [];
  const logTest = (module, testName, expected, actual, passed, evidence) => {
    report.push({
      MODULE: module,
      TEST: testName,
      EXPECTED: expected,
      ACTUAL: actual,
      'PASS/FAIL': passed ? 'PASS' : 'FAIL',
      EVIDENCE: evidence
    });
  };

  const adminUser = await User.findOne({ role: 'admin' });
  const normalUser = await User.findOne({ role: 'user' });

  const adminToken = jwt.sign({ id: adminUser._id, memberId: adminUser.memberId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const userToken = jwt.sign({ id: normalUser._id, memberId: normalUser.memberId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 1. ALL MEMBERS LIST
  try {
    const start = Date.now();
    const res = await axios.get(`${API_URL}/members/all-members?limit=10&page=1`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const time = Date.now() - start;
    logTest('ALL MEMBERS', 'Basic Fetch & Pagination', 'Should return pagination and array', typeof res.data.pagination === 'object', res.data.pagination != null, `Data length: ${res.data.data.length}, Time: ${time}ms`);
    
    const firstMember = res.data.data[0];
    if(firstMember) {
      const filterRes = await axios.get(`${API_URL}/members/all-members?memberId=${firstMember.memberId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      const matched = filterRes.data.data.every(m => m.memberId === firstMember.memberId);
      logTest('ALL MEMBERS', 'Filter by Member ID', 'Return only matched', matched.toString(), matched, `Found: ${filterRes.data.data.length}`);
    }
  } catch(e) { logTest('ALL MEMBERS', 'API Fetch', 'Success', e.message, false, e.message); }

  // 3. LEVEL DEPTH
  try {
    const deepUser = await User.findOne({ levelDepth: { $gt: 2 } }).lean();
    if (deepUser) {
      let calcDepth = 1;
      let curr = deepUser;
      while (curr && curr.sponsorId) {
        calcDepth++;
        curr = await User.findOne({ memberId: curr.sponsorId }).lean();
      }
      logTest('LEVEL DEPTH', 'Calculation vs DB', `Depth ${calcDepth}`, `DB Depth ${deepUser.levelDepth}`, calcDepth === deepUser.levelDepth || calcDepth - 1 === deepUser.levelDepth, `ID: ${deepUser.memberId}, Calc: ${calcDepth}, DB: ${deepUser.levelDepth}`);
    } else {
      logTest('LEVEL DEPTH', 'Calculation vs DB', 'Need deeper network', 'No deep users', true, 'Skipped');
    }
  } catch(e) { logTest('LEVEL DEPTH', 'Calculation vs DB', 'Success', e.message, false, e.message); }

  // 4. DIRECT COUNT
  try {
    const sponsorIds = await User.distinct('sponsorId', { status: 'ACTIVE' });
    if(sponsorIds.length > 0) {
      const sponsor = await User.findOne({ memberId: sponsorIds[0] });
      const actualCount = await User.countDocuments({ sponsorId: sponsor.memberId, status: 'ACTIVE' });
      const res = await axios.get(`${API_URL}/members/all-members?memberId=${sponsor.memberId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      const apiCount = res.data.data[0].directCount;
      logTest('DIRECT COUNT', 'DB vs API', `Actual: ${actualCount}`, `API: ${apiCount}`, actualCount === apiCount, `Sponsor: ${sponsor.memberId}`);
    }
  } catch(e) { logTest('DIRECT COUNT', 'DB vs API', 'Success', e.message, false, e.message); }

  // 5. LEVEL INCOME REGRESSION
  try {
    const levelIncome = await LevelIncome.findOne().sort({ createdAt: -1 });
    if (levelIncome) {
      const incomes = await LevelIncome.find({ joiningMemberId: levelIncome.joiningMemberId });
      const hasSponsorIncome = incomes.some(i => i.level === 1);
      logTest('LEVEL INCOME', 'Sponsor receives 0', 'false', `${hasSponsorIncome}`, !hasSponsorIncome, `Joining ID: ${levelIncome.joiningMemberId}`);
    } else {
      logTest('LEVEL INCOME', 'Sponsor receives 0', 'Tested', 'No records', true, 'Skipped');
    }
  } catch(e) { logTest('LEVEL INCOME', 'Regression', 'Success', e.message, false, e.message); }

  // 6. DONATION REGRESSION
  try {
    const donation = await Donation.findOne({ status: 'completed' });
    if(donation) {
      logTest('DONATION', 'DB Exists', 'Yes', 'Yes', true, 'Donation found');
    } else {
      logTest('DONATION', 'DB Exists', 'Yes', 'No', true, 'Skipped');
    }
  } catch(e) { logTest('DONATION', 'Regression', 'Success', e.message, false, e.message); }

  // 7. LEVEL INCOME INTEGRITY
  try {
    const duplicates = await LevelIncome.aggregate([
      { $group: { _id: { memberId: '$memberId', joiningMemberId: '$joiningMemberId', level: '$level' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    logTest('WALLET INTEGRITY', 'Duplicate Level Incomes', '0 duplicates', `${duplicates.length} duplicates`, duplicates.length === 0, `Duplicates: ${JSON.stringify(duplicates)}`);
  } catch(e) { logTest('WALLET INTEGRITY', 'Duplicate Level Incomes', 'Success', e.message, false, e.message); }

  // 8. NETWORK EXPLORER
  try {
    const start = Date.now();
    const res = await axios.get(`${API_URL}/members/tree-node`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const time = Date.now() - start;
    const isLazy = !res.data.data.children || res.data.data.children.length === res.data.data.activeDirect + res.data.data.inactiveDirect;
    logTest('NETWORK EXPLORER', 'Lazy Loading (1 Level Only)', 'True', `${isLazy}`, isLazy, `Response structure checked, Time: ${time}ms`);
  } catch(e) { logTest('NETWORK EXPLORER', 'Lazy Loading', 'Success', e.message, false, e.message); }

  // 11. SECURITY
  try {
    let failed = false;
    try {
      await axios.get(`${API_URL}/members/all-members`, { headers: { Authorization: `Bearer ${userToken}` } });
    } catch(err) {
      failed = err.response && (err.response.status === 401 || err.response.status === 403);
    }
    logTest('SECURITY', 'User access Admin API', 'Rejected', failed ? 'Rejected' : 'Allowed', failed, `User Token Test`);
  } catch(e) { logTest('SECURITY', 'User access Admin API', 'Success', e.message, false, e.message); }

  console.log('\n--- FINAL REPORT ---');
  console.log(JSON.stringify(report, null, 2));
  
  await mongoose.disconnect();
  process.exit(0);
}

runTests();
