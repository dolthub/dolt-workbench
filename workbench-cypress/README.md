# Workbench Cypress

End-to-end testing suite for the Dolt Workbench application using Cypress.
.

## Prerequisites

- Node.js and Yarn
- A running instance of Dolt Workbench (typically on `http://localhost:3002`)

## Installation

```bash
yarn install
```

## Configuration

The tests are configured to run against `http://localhost:3002` by default. This can be overridden using Cypress configuration options.

### Environment Variables

- `WORKBENCH_CONNECTION_URL`: Connection URL for the workbench instance. This should be the `automated-testing/us-jails` deployment on the Hosted Dolt development site. Ask Taylor for the connection URL, which can go in ` cypress.env.json` file if running the tests from your computer.
- `CYPRESS_LOCAL`: Set to `true` when running tests against a local development server

## Running Tests

### Interactive Mode (Local Development)

```bash
yarn cy-open-local
```

Opens the Cypress Test Runner for interactive test development and debugging.

### Headless Mode (Local Development)

```bash
yarn cy-run-local
```

Runs all tests in headless mode against the local development server.

### CI Mode

```bash
yarn cy-chrome
```

Runs tests in Chrome browser for continuous integration.

## Troubleshooting

- Ensure the Dolt Workbench server is running on the expected port
- Check that all dependencies are installed with `yarn install`
- For local development, use the `-local` script variants
