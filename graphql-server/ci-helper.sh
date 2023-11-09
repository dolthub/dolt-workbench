#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Must supply graphql-server package dir: ./ci-helper.sh ./graphql-server"
  exit 1
fi

# compile and build graphql
(
  yarn run build
)

# check server can run and type changes are committed
(
  node "$1"/check-server.js
)

# Check for uncommitted changes
out=$(git status --porcelain)

if [ -z "$out" ]; then
  exit 0
fi

echo "Found uncommitted changes during CI"
echo $out
exit 1
