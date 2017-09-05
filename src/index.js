'use strict';

const express = require('express');
const createRenderer = require('./renderer');

const port = process.env.PORT || 3000;

let renderer = null;

const app = express();

// Configure.
app.disable('x-powered-by');

// Render url.
app.use(async (req, res, next) => {
  if (!req.query.url) {
    return res.status(400).send('Search with url parameter. For eaxample, ?url=http://yourdomain');
  }

  try {
    switch (req.query.type) {
      case 'pdf':
        const pdf = await renderer.pdf(req.query.url);
        res.set('Content-type', 'application/pdf').send(pdf);
        break;

      case 'screenshot':
        const image = await renderer.screenshot(req.query.url);
        res.set('Content-type', 'image/png').send(image);
        break;

      default:
        const html = await renderer.render(req.query.url);
        res.status(200).send(html);
    }
  } catch (e) {
    next(e);
  }
});

// Error page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Oops, An expected error seems to have occurred.');
});

// Create renderer and start server.
createRenderer().then((createdRender) => {
  renderer = createdRender;
  console.info('Initialized renderer.');

  app.listen(port, () => {
    console.info(`Listen port on ${port}.`);
  });
}).catch((e) => {
  console.error('Fail to initialze renderer.', e);
});
