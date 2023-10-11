#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Must supply graphql-server package dir: ./ci-helper.sh ./packages/graphql-server"
  exit 1
fi

# compile web
(
  cd "$1"/../web
  yarn run compile
)

# compile and build graphql
(
  cd "$1"/../graphql-server
  yarn run compile
  yarn run build
)

# check server can run and type changes are committed
(
  node "$1"/check-server.js
)

exit 0
