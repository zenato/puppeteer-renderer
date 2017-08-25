const express = require('express');
const createRenderer = require('./renderer');

const port = process.env.PORT || 3000;

const app = express();

// Configure.
app.disable('x-powered-by');

let render = null;

// Index page.
app.get('/', (req, res) => {
  res.redirect('/render');
});

// Render url.
app.get('/render', async (req, res, next) => {
  if (!req.query.url) {
    return res.status(400).send('Search with url parameter. For eaxample, ?url=http://yourdomain');
  }

  try {
    const html = await render(req.query.url);
    res.status(200).send(html);
  } catch (e) {
    next(e);
  }
});

// Page not found.
app.use((req, res) => {
  res.status(404).send('Page not found.');
});

// Error page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Oops, An expected error seems to have occurred.');
});

// Create renderer and start server.
createRenderer().then((createdRender) => {
  render = createdRender;
  console.info('Initialized renderer.');

  app.listen(port, () => {
    console.info(`Listen port on ${port}.`);
  });
}).catch((e) => {
  console.error('Fail to initialze renderer.', e);
});
