const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE UNCAUGHT ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (err) {
    console.log('NAVIGATION ERROR:', err.message);
  }
  
  await browser.close();
})();
