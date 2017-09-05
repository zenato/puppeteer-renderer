'use strict';

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
    let page = null;
    try {
      page = await this.createPage(url);
      const html = await page.evaluate(() => {
        return document.documentElement.outerHTML;
      });
      return html;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async pdf(url) {
    let page = null;
    try {
      page = await this.createPage(url);
      const buffer = await page.pdf({ format: 'A4' });
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async screenshot(url) {
    let page = null;
    try {
      page = await this.createPage(url);
      const buffer = await page.screenshot({ fullPage: true });
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  return new Renderer(browser);
}

module.exports = create;
