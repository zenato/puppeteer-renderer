const puppeteer = require('puppeteer');

async function render(url) {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const html = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  browser.close();

  return html;
}

module.exports = render;
