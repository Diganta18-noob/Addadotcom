const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const assets = [
  { name: 'architecture-workflow', width: 900, height: 560, duration: 2.8, fps: 25 },
  { name: 'realtime-engine', width: 900, height: 420, duration: 2.8, fps: 25 },
  { name: 'quick-start-workflow', width: 900, height: 240, duration: 2.4, fps: 25 },
  { name: 'hero-banner', width: 900, height: 440, duration: 3.0, fps: 20 },
  { name: 'why-addadotcom', width: 900, height: 520, duration: 3.5, fps: 20 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const asset of assets) {
    const page = await browser.newPage();
    await page.setViewport({ width: asset.width, height: asset.height, deviceScaleFactor: 2 });
    
    const svgPath = path.resolve(__dirname, `../docs/assets/${asset.name}.svg`);
    const fileUrl = `file://${svgPath.replace(/\\/g, '/')}`;
    
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    const framesDir = path.resolve(__dirname, `../temp_frames/${asset.name}`);
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const totalFrames = Math.floor(asset.duration * asset.fps);
    const intervalMs = 1000 / asset.fps;

    console.log(`Rendering ${totalFrames} frames for ${asset.name}...`);
    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(framesDir, `frame_${String(i).padStart(4, '0')}.png`);
      await page.screenshot({ path: framePath, omitBackground: false });
      await new Promise(r => setTimeout(r, intervalMs));
    }

    await page.close();
  }

  await browser.close();
  console.log('Frame rendering complete.');
})();
