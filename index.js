const express = require('express');
const createRenderer = require('./renderer');

const port = process.env.PORT || 3000;

const app = express();

createRenderer().then((render) => {
  console.info('Initialized renderer.');

  app.use(async (req, res) => {
    if (!req.query.url) {
      return res.status(400).send('Search with url parameter. For eaxample, ?url=http://yourdomain');
    }

    try {
      const html = await render(req.query.url);
      res.status(200).send(html);
    } catch (e) {
      console.error(e);
      res.status(500).send('Oops, An expected error seems to have occurred.');
    }
  });

  app.listen(port, () => {
    console.info(`Listen port on ${port}.`);
  });
});
