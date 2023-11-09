FROM --platform=linux/arm64/v8 node:18.18.0 as builder

RUN mkdir build
WORKDIR build

COPY ./packages/web/package.json .
RUN yarn install

COPY ./packages/web .
RUN yarn build

FROM --platform=linux/arm64/v8 node:18.18.0-alpine3.18

RUN mkdir -p /usr/dolt-workbench
WORKDIR /usr/dolt-workbench
COPY --from=builder /build/. .

ENV NODE_ENV=production
EXPOSE 3000
CMD [ "npm", "start" ]
