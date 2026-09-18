const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const TEST_MEMBER_ID = 'TC_U1_D0';

const results = [];
const visited = new Set();
const queue = [];

async function crawl(contextName, startUrl, setupFn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`\n=== Starting crawl for ${contextName} ===`);

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageErrors.push(msg.text());
    }
  });

  await setupFn(page);

  queue.push(startUrl);

  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    
    const pathPart = url.replace(BASE_URL, '');
    if (pathPart.includes(':') || !url.startsWith(BASE_URL) || url.includes('logout') || url.includes('/invoice')) {
      visited.add(url);
      continue;
    }

    visited.add(url);
    console.log(`[${contextName}] Visiting: ${url}`);
    
    pageErrors.length = 0; // Clear previous errors
    
    let isBlank = false;
    let failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url() + ' ' + request.failure().errorText);
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      // wait a bit for any react re-renders
      await page.waitForTimeout(1000);
      
      const rootHtml = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.innerHTML.trim() : '';
      });

      if (!rootHtml || rootHtml.length < 50 || rootHtml.includes('Minified React error')) {
         isBlank = true;
      }

      // Check for specific crash text
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('TypeError: Cannot read properties of') || bodyText.includes('Application error')) {
         isBlank = true;
         pageErrors.push("Body contains crash text");
      }
      
      // Extract links to continue crawling
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
      });

      for (const link of links) {
        if (link.startsWith(BASE_URL) && !visited.has(link) && !queue.includes(link)) {
          if (contextName === 'Admin' && link.includes('/admin/')) queue.push(link);
          if (contextName === 'User' && link.includes('/user/')) queue.push(link);
        }
      }

    } catch (e) {
      pageErrors.push(e.message);
    }

    const filteredErrors = pageErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError') || e.includes('Cannot read') || e.includes('Failed to') || e.includes('Minified React error'));

    const status = (isBlank || filteredErrors.length > 0) ? 'FAILED' : 'PASSED';
    
    results.push({
      context: contextName,
      url,
      status,
      isBlank,
      errors: filteredErrors.length > 0 ? filteredErrors : undefined,
      failedRequests: failedRequests.length > 0 ? failedRequests : undefined
    });
    
    if (status === 'FAILED') {
      console.log(`   -> FAILED: ${filteredErrors[0] || 'Blank Page'}`);
    } else {
      console.log(`   -> PASSED`);
    }
  }

  await browser.close();
}

async function run() {
  // Admin Crawl
  await crawl('Admin', `${BASE_URL}/admin/dashboard`, async (page) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

    // Queue up all admin routes
    const allRoutes = JSON.parse(fs.readFileSync('scratch/extracted_routes.json', 'utf8'));
    for (const r of allRoutes) {
      if (r.includes('admin') && !r.includes(':')) {
         const fullUrl = r.startsWith('/') ? BASE_URL + r : BASE_URL + '/' + r;
         queue.push(fullUrl);
      }
    }
  });

  // User Crawl
  await crawl('User', `${BASE_URL}/user/dashboard`, async (page) => {
    // We login as admin first, then we can maybe fetch token or just set localStorage directly
    // Let's just login as admin, then go to the "Members" or set localStorage.
    // Actually, setting userToken directly is easiest.
    // I need to fetch the userToken first from the backend.
    const http = require('http');
    const getAdminToken = () => new Promise((resolve, reject) => {
       const req = http.request('http://localhost:5001/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' }
       }, res => {
         let data = '';
         res.on('data', chunk => data+=chunk);
         res.on('end', () => resolve(JSON.parse(data).token));
       });
       req.write(JSON.stringify({email: ADMIN_EMAIL, password: ADMIN_PASSWORD}));
       req.end();
    });
    
    const adminToken = await getAdminToken();
    
    const getUserToken = () => new Promise((resolve, reject) => {
       const req = http.request('http://localhost:5001/api/auth/admin-login-user', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken }
       }, res => {
         let data = '';
         res.on('data', chunk => data+=chunk);
         res.on('end', () => resolve(JSON.parse(data).token));
       });
       req.write(JSON.stringify({memberId: TEST_MEMBER_ID}));
       req.end();
    });
    
    const userToken = await getUserToken();
    
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('userToken', token);
    }, userToken);

    // Queue up all user routes
    const allRoutes = JSON.parse(fs.readFileSync('scratch/extracted_routes.json', 'utf8'));
    for (const r of allRoutes) {
      if (!r.includes('admin') && !r.includes(':') && r.trim() !== '') {
         const fullUrl = r.startsWith('/') ? BASE_URL + r : BASE_URL + '/' + r;
         queue.push(fullUrl);
      }
    }
  });

  fs.writeFileSync('scratch/crawler_report.json', JSON.stringify(results, null, 2));
  console.log('\nCrawling finished. Saved to scratch/crawler_report.json');
  console.log(`Total URLs visited: ${results.length}`);
  console.log(`Failed URLs: ${results.filter(r => r.status === 'FAILED').length}`);
}

run().catch(console.error);
