const puppeteer = require('puppeteer');

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  return async function (url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const html = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    await page.close();
    return html;
  }
}

module.exports = create;
