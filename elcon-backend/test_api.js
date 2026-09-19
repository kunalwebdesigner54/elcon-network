const http = require('http');

const data = JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const loginRes = JSON.parse(body);
    console.log('Login token:', loginRes.token ? 'Success' : 'Failed');
    if (!loginRes.token) return;

    const txOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/transactions?scope=admin',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + loginRes.token
      }
    };

    const txReq = http.request(txOptions, (txRes) => {
      let txBody = '';
      txRes.on('data', chunk => txBody += chunk);
      txRes.on('end', () => {
        const txData = JSON.parse(txBody);
        console.log('Transactions Count:', txData.transactions?.length);
        const epinRows = (txData.transactions || []).filter(t => t.description.includes('EPIN GENERATION') || t.description.includes('E-Pin Generated'));
        console.log('Recent EPIN Rows:');
        console.log(JSON.stringify(epinRows.slice(0, 10), null, 2));
      });
    });
    txReq.end();
  });
});

req.write(data);
req.end();
