# dolt-workbench

A SQL workbench for your MySQL-compatible database. Use [Dolt](https://doltdb.com) to unlock
powerful version control features, such as branches, commits, and merge.

## Getting Started

### Using Docker

```
% docker compose up -d
```

Navigate to http://localhost:3002 to enter database information.

### From source

Clone this repository and install/compile the code:

```
% yarn && yarn compile
```

### Run the GraphQL server

```
% cd packages/graphql-server
graphql-server% yarn dev
```

If you want the server to start up with a configured database connection, add a
`.development.env` file with a `DATABASE_CONNECTION` field, like so:

```bash
DATABASE_URL="mysql://[username]:[password]@[host]/[database]"
```

Otherwise you will be able to provide a connection string from the UI.

### Run the web server

In another shell, start the web server. This will automatically point at the running
GraphQL server (localhost:9002).

```
% cd packages/web
web% yarn dev
```

Open your browser to [localhost:3002](http://localhost:3002).
