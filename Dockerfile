###################
# BUILD GRAPHQL SERVER
###################
FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as graphql-base

FROM graphql-base AS graphql-deps
WORKDIR /app/graphql-server

# Copy the package.json and yarn files
COPY --chown=node:node graphql-server/.yarn ./.yarn
COPY --chown=node:node graphql-server/yarn.lock graphql-server/package.json graphql-server/.yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy the GraphQL server source code
FROM graphql-base AS graphql-build
WORKDIR /app/graphql-server
RUN apk update && apk add curl
COPY --chown=node:node --from=graphql-deps /app/graphql-server/node_modules ./node_modules
COPY --chown=node:node ./graphql-server .

# Build the GraphQL server
RUN yarn run build

ENV NODE_ENV production

# Clean up the build
RUN yarn workspaces focus --production && yarn cache clean

RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN node-prune

USER node


###################
# BUILD NEXT.JS SERVER
###################
FROM --platform=linux/amd64 node:18.13.0-alpine3.17 as web-base

# Install dependencies only when needed
FROM web-base AS web-deps

# Set the working directory
RUN apk add --no-cache libc6-compat
WORKDIR /app/web

# Copy the package.json and package-lock.json files
COPY web/.yarn ./.yarn
COPY web/yarn.lock web/package.json web/.yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy the Next.js web server source code
FROM web-base AS web-build
WORKDIR /app/web
COPY --from=web-deps /app/web/node_modules ./node_modules
COPY ./web .

# Build the Next.js web server
RUN yarn run build


###################
# COMBINE
###################
FROM --platform=linux/amd64 node:18.13.0-alpine3.17 AS production

# Set the working directory
WORKDIR /app

COPY ./process.yml .

# Install pm2 globally
RUN npm install -g pm2

# Copy the built files from the graphql-build stage
COPY --chown=node:node --from=graphql-build /app/graphql-server/node_modules ./graphql-server/node_modules
COPY --chown=node:node --from=graphql-build /app/graphql-server/dist ./graphql-server/dist

EXPOSE 9002

COPY --from=web-build /app/web/public ./web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=web-build /app/web/.next/standalone ./web/
COPY --from=web-build /app/web/.next/static ./web/.next/static

# USER nextjs

EXPOSE 3000

ENV HOSTNAME "0.0.0.0"

# Start both servers using pm2
CMD ["pm2-runtime", "/app/process.yml"]
