'use strict';

const { expect } = require('chai');
const createRenderer = require('../src/renderer');

describe('Renderer', function () {
  let renderer = null;

  before(async () => {
    this.timeout(10 * 1000);
    renderer = await createRenderer();
  });

  it('should take rendered HTML code', async () => {
    const html = await renderer.render('http://www.google.com');
    expect(html).to.be.a('string');
  });
});
