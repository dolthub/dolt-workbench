# dolt-workbench-app

A modern, browser-based, open source SQL workbench desktop app for your MySQL and PostgreSQL
compatible databases. Use [Dolt](https://doltdb.com) to unlock powerful version control
features. [Doltgres](https://github.com/dolthub/doltgresql) support coming soon.

## Getting started from source

First, clone this repository. Then run `yarn` in root directory to install dependencies.

### Dev

Run `yarn dev` to start dev mode with dev tool.

### Build the app
Run `yarn build` to build the app, and the built app will be found under `dist`.

`electron-builder` defaults to building for the current platform. To build for `mac`, `windows` and `linux`, use `yarn dist-all`.