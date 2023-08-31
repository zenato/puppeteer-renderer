FROM ghcr.io/puppeteer/puppeteer:21.1.1

EXPOSE 3000

USER root

WORKDIR /app

COPY . ./

RUN npm install pnpm -g

RUN pnpm i

RUN pnpm run build

RUN chown -R pptruser:pptruser /app

USER pptruser

CMD pnpm run start
