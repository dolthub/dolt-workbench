###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as development

WORKDIR /app

COPY .yarn ./.yarn
COPY --chown=node:node yarn.lock package.json .yarnrc.yml ./

RUN yarn install --immutable

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as build

WORKDIR /app

COPY .yarn ./.yarn
COPY --chown=node:node yarn.lock package.json .yarnrc.yml ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn run build

ENV NODE_ENV development

RUN yarn workspaces focus --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Start the server using the production build
EXPOSE 9002
CMD [ "node", "dist/main.js" ]


# Source: https://www.tomray.dev/nestjs-docker-production#putting-it-all-together