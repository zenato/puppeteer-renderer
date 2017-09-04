'use strict';

const { expect } = require('chai');
const createRenderer = require('../src/renderer');

let renderer = null;

before(async () => {
  renderer = await createRenderer();
});

describe('Renderer', function () {
  this.timeout(10 * 1000);

  it('should take rendered HTML code', async () => {
    const html = await renderer.render('http://www.google.com');
    expect(html).to.be.a('string');
  });
});
