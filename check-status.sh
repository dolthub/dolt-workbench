#!/bin/bash

set -e

out=$(git status --porcelain)

if [ -z "$out" ]; then
  exit 0
fi

echo "Found uncommitted changes during CI"
echo $out
exit 1
