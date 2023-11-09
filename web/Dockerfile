###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as development

# Create app directory
WORKDIR /usr/src/app

COPY .yarn ./.yarn
COPY --chown=node:node yarn.lock package.json .yarnrc.yml ./

RUN yarn install --immutable

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as build

# Create app directory
WORKDIR /usr/src/app

COPY .yarn ./.yarn
COPY --chown=node:node yarn.lock package.json .yarnrc.yml ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn run build

ENV NODE_ENV production

RUN yarn workspaces focus --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build --chown=node:node /usr/src/app/.next/standalone ./
COPY --from=build --chown=node:node /usr/src/app/.next/static ./.next/static

# Start the server using the production build
EXPOSE 3000
CMD ["node", "server.js"]

# RUN mkdir build
# WORKDIR build

# COPY ./packages/web/package.json .
# RUN yarn install

# COPY ./packages/web .
# RUN yarn build

# FROM --platform=linux/arm64/v8 node:18.18.0-alpine3.18

# RUN mkdir -p /usr/dolt-workbench
# WORKDIR /usr/dolt-workbench
# COPY --from=builder /build/. .

# ENV NODE_ENV=production
# EXPOSE 3000
# CMD [ "npm", "start" ]
