const { expect } = require('chai');
const createRenderer = require('../src/renderer');

describe('Renderer', function() {
  this.timeout(10 * 1000);

  it('should take rendered HTML code', async () => {
    const renderer = await createRenderer();
    const html = await renderer.render('http://www.google.com');
    expect(html).to.be.a('string');
  });
});

