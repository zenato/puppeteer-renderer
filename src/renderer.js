'use strict';

const puppeteer = require('puppeteer');

class Renderer {
  constructor(browser) {
    this.browser = browser;
  }

  async createPage(url) {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    return page;
  }

  async render(url) {
    let page = null;
    try {
      page = await this.createPage(url);
      const html = await page.content();
      return html;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async pdf(url, options) {
    let page = null;
    try {
      page = await this.createPage(url);
      const defaultOptions = { format: 'A4' }
      const buffer = await page.pdf(Object.assign(defaultOptions, options));
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async screenshot(url, options) {
    let page = null;
    try {
      page = await this.createPage(url);
      const defaultOptions = { fullPage: true  }
      const buffer = await page.screenshot(Object.assign(defaultOptions, options));
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async close() {
    await this.browser.close()
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  return new Renderer(browser);
}

module.exports = create;
