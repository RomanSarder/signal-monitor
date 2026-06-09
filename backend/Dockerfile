FROM node:lts-slim AS builder

# update packages, to reduce risk of vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get autoclean -y && apt-get autoremove -y

# set a non privileged user to use when running this image
RUN groupadd -r nodejs && useradd -g nodejs -s /bin/bash -d /home/nodejs -m nodejs
USER nodejs
# set right (secure) folder permissions
RUN mkdir -p /home/nodejs/app/node_modules && chown -R nodejs:nodejs /home/nodejs/app

WORKDIR /home/nodejs/app

# set default node env
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

ENV NPM_CONFIG_LOGLEVEL=warn

# copy project definition/dependencies files, for better reuse of layers
COPY --chown=nodejs:nodejs package*.json ./

# install dependencies here, for better reuse of layers
RUN npm ci --omit=dev && npm audit fix && npm cache clean --force

# copy all sources in the container (exclusions in .dockerignore file)
COPY --chown=nodejs:nodejs . .

RUN npm run build:ts

# This results in a single layer image
FROM node:lts-alpine AS release
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs
WORKDIR /home/nodejs/app
COPY --from=builder /home/nodejs/app/dist ./dist
COPY --from=builder /home/nodejs/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "./node_modules/.bin/fastify", "start", "-l", "info", "./dist/app.js"]
