FROM alpine:edge

# Installs latest Chromium (77) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm


# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY . /app
RUN cd /app && npm install --quiet && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
EXPOSE 3000
WORKDIR /app
CMD npm run start
