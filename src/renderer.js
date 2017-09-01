const puppeteer = require('puppeteer');

class Renderer {
  constructor(browser) {
    this.browser = browser;
  }

  async createPage(url) {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    return page;
  }

  async render(url) {
    const page = await this.createPage(url);
    const html = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    await page.close();
    return html;
  }

  async pdf(url) {
    const page = await this.createPage(url);
    const buffer = await page.pdf({ format: 'A4' });
    return buffer;
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  return new Renderer(browser);
}

module.exports = create;
