# Puppeteer(Chrome headless node API) based web page renderer

Puppeteer(Chrome headless node API) based web page renderer.

Useful server side rendering through proxy.


## Requirements
You can run Chromium or docker.


## Getting Started

### Install dependencies.
`npm install`

### Start server (If you can run Chromium)
`npm start`

(service port: 3000)

### Start server using docker (If you can not run Chromium and installed docker)
`docker run -d --name renderer -p 8080:3000 zenato/puppeteer-renderer`

### Test on your browser
Input url `http://localhost:{port}/?url=https://www.google.com`

If you can see html code, server works fine.

### Set proxy on your own service server

If you have active service, Please set proxy confuration.

For example (Used express.js)
```js
const app = require('express')();
const axios = require('axios');

app.use(async (req, res, next) => {
  // Check some condition.
  if (!req.get('user-agent').includes('Facebot')) {
    return next();
  }

  const url = encodeURIComponent(`http://current-service-host:port${req.originalUrl}`);
  const { data } = await axios.get(`http://puppet-renderer-server:port?url=${url}`);
  res.send(data);
});

app.listen(8080);
```

## API

| Name  | Required | Value   | Description            |Usage                                                   |
|-------|:--------:|:-------:|------------------------|--------------------------------------------------------|
|url    |O         |         |Target URL              |http://puppeterr-renderer?url=http://www.google.com         |
|type   |          |(pdf|screenshot)    |Rendering another type. |http://puppeterr-renderer?url=http://www.google.com&type=pdf|

