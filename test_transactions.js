require('dotenv').config({ path: 'elcon-backend/.env' });
const mongoose = require('mongoose');
const { getTransactionHistory } = require('./elcon-backend/controllers/transactionsController');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const req = {
    query: {
      scope: 'admin',
      limit: '20'
    },
    user: {
      role: 'admin',
      id: 'mock',
      memberId: 'admin'
    }
  };
  
  const res = {
    json: (data) => {
      console.log('Transactions Count:', data.transactions.length);
      const epinRows = data.transactions.filter(t => t.description.includes('EPIN GENERATION') || t.description.includes('E-Pin Generated'));
      console.log('Epin Rows:', JSON.stringify(epinRows, null, 2));
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.error('Error', code, data);
        process.exit(1);
      }
    })
  };
  
  await getTransactionHistory(req, res);
}

run();
