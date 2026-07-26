const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const pages = [
    { name: 'homepage.png', url: 'https://addadotcom.vercel.app/' },
    { name: 'menu.png', url: 'https://addadotcom.vercel.app/menu' },
    { name: 'tracker.png', url: 'https://addadotcom.vercel.app/track/ord_123' },
    { name: 'kds.png', url: 'https://addadotcom.vercel.app/admin/kitchen' },
    { name: 'billing.png', url: 'https://addadotcom.vercel.app/admin/billing' },
    { name: 'analytics.png', url: 'https://addadotcom.vercel.app/admin/analytics' },
    { name: 'invoice.png', url: 'https://addadotcom.vercel.app/invoice/inv_123' },
    { name: 'tables.png', url: 'https://addadotcom.vercel.app/admin/tables' },
    { name: 'qr.png', url: 'https://addadotcom.vercel.app/menu?table=4' }
  ];

  for (const item of pages) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000); // Allow animations & fonts to render fully
      const targetPath = path.join(screenshotsDir, item.name);
      await page.screenshot({ path: targetPath, fullPage: false });
      console.log(`[OK] Saved screenshot: ${item.name}`);
    } catch (err) {
      console.error(`[ERROR] Failed to capture ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Finished capturing all real website screenshots.');
}

capture();
