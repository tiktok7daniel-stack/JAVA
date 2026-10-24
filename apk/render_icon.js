// Rende l'icona di marca (www/icons/icon.svg) in PNG per il launcher Android (xxxhdpi = 192 px).
// Uso: node apk/render_icon.js   (richiede Playwright con Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'www', 'icons', 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 192, height: 192 }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg width="192" height="192" ')}</body></html>`);
  await page.screenshot({ path: path.join(__dirname, 'res', 'icon-192.png'), omitBackground: true, clip: { x: 0, y: 0, width: 192, height: 192 } });
  await browser.close();
  console.log('icona generata: apk/res/icon-192.png');
})();
