const { chromium } = require('playwright');
const http = require('http');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login as admin to get token
  const token = await new Promise((resolve) => {
    const req = http.request('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).token));
    });
    req.write(JSON.stringify({ email: 'admin@elcon.com', password: 'admin' }));
    req.end();
  });

  await page.goto('http://localhost:3000');
  await page.evaluate((t) => localStorage.setItem('token', t), token);

  // Visit the buggy page
  page.on('pageerror', e => console.error('React Crash:', e));
  page.on('console', msg => console.log('Console:', msg.text()));

  await page.goto('http://localhost:3000/donations/ReceivedHelp', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scratch/bug_ReceivedHelp.png' });
  console.log('Done, screenshot saved to scratch/bug_ReceivedHelp.png');
  const root = await page.$eval('#root', el => el.innerHTML);
  console.log('Root HTML length:', root.length);
  await browser.close();
}
test();
