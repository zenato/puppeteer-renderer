FROM ghcr.io/puppeteer/puppeteer:19.8.5

EXPOSE 3000

USER root

WORKDIR /app

COPY . ./

RUN npm i

RUN chown -R pptruser:pptruser /app

USER pptruser

CMD npm run start
