# dolt-workbench

A modern, browser-based, open source SQL workbench for your MySQL and PostgreSQL
compatible databases. Use [Dolt](https://doltdb.com) or
[Doltgres](https://github.com/dolthub/doltgresql) to unlock powerful version control
features.

## Installation

There are a few ways to install the Dolt Workbench:

- Download the desktop application for [macOS](https://apps.apple.com/us/app/dolt-workbench/id6720702995?mt=12) or [Windows](https://apps.microsoft.com/detail/9nq8lqph9vvh?hl=en-us&gl=US)
- Download the desktop application for macOS or Windows from [Releases](https://github.com/dolthub/dolt-workbench/releases)
- [Pull the Docker Hub image](https://hub.docker.com/r/dolthub/dolt-workbench)
- [Build from source](https://github.com/dolthub/dolt-workbench?tab=readme-ov-file#getting-started-from-source)

### Linux Experimental Build

We now provide experimental Linux builds (.AppImage). Please note:

- Currently only tested on Ubuntu 25.04
- May encounter sandbox restrictions due to [Ubuntu's AppImage policies](https://github.com/electron/electron/issues/42510#issuecomment-2171583086)

If you encounter Sandbox errors when running `./ Dolt-Workbench-linux-arm64.AppImage` and see:

```bash
The SUID sandbox helper binary was found, but is not configured correctly.
```

Try one of these solutions:

1. Lift restrictions temporarily (lasts until reboot):

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

2. Run with sandbox disabled (required each launch):

```bash
./ Dolt-Workbench-linux-arm64.AppImage --no-sandbox
```

## Features

Whether you decide to connect this workbench to a MySQL, Dolt, or PostgreSQL database, the
Dolt Workbench has many features that make it the most modern and user-friendly web-based
workbench on the market.

### Modern, web-based table browser

Why is your SQL workbench stuck in 2003? The Dolt Workbench brings a modern browser-based UI to the
workbench features you know and love. It makes browsing table data and schemas more
intuitive and looks good doing it.

<img width="1357" alt="Modern, web based table-browser" src="https://www.dolthub.com/blog/static/3f1358cd506d7b8ed383ea0751b67446/4f2ef/table-browser.png">

### Auto-generate SQL queries

Don't know SQL? Utilize table cell buttons and query helpers to generate and execute SQL
queries for you, while learning SQL along the way. Or execute your own SQL queries from
the console with the help of syntax highlighting.

![SQL queries](./images/sql-queries.png)

### Edit data using point and click interface

Cell buttons can also be used to edit data. Double click into any cell to edit its value
and easily remove or add rows, columns, and tables using helper buttons.

![Edit data](./images/edit-data.png)

### ER diagrams

ER diagrams are a great tool to visualize the entities in your database and the
relationship between tables. They help to analyze the structure of the database.

![ER diagrams](./images/er-diagram.png)

### File upload

Upload files from your computer or use the spreadsheet editor to add or modify rows in
your table directly from the web interface.

![File upload](./images/file-importer.png)

## Version control features with [Dolt](https://doltdb.com)

[Dolt](https://doltdb.com) is a SQL database you can fork, clone, branch, merge, push and
pull just like a Git repository. When connecting the workbench to a Dolt database, you
gain access to these powerful version control features.

### Commit log visualizations

Easily visualize your commits and understand your commit history from the commit graph. It
displays information about branches, commits, and collaborators in a single view. You'll
be able to easily identify contributions, track down specific commits, and gain valuable
insights into your development process.

![Commit graph](./images/commit-graph.png)

### Branch navigation

A branch adds non-distributed, write isolation to your database. If you have a set of
database changes that logically should be grouped or reviewed together, you make
those changes on a branch.

![Branch navigation](./images/branches.png)

### Tags

Tag your data at a commit to represent a data release. Data releases are a collection of
data with a specific schema and known set of data points. They are often used to represent
data you may want to recreate at a later date, like to reproduce a machine learning model.

![Tags](./images/tags.png)

### Pull requests

Pull requests are a way to propose changes to a database. A pull request is created from a
branch with new changes that a user would like to make to another branch (commonly the
`main` branch). Easily review the diff of proposed changes and think through potential
improvements or implications of the change. The pull request can then be merged, which
will update the base branch with the changes from the feature branch.

![Pull requests](./images/pull-diff.png)

## Getting started

The easiest way to get started is with Docker. Assuming you have Docker
[installed](https://www.docker.com/get-started/) and running, you can simply pull and run
the [Docker image](https://hub.docker.com/r/dolthub/dolt-workbench).

```
% docker pull dolthub/dolt-workbench:latest
% docker run -p 9002:9002 -p 3000:3000 dolthub/dolt-workbench:latest
```

Navigate to http://localhost:3000 to enter your database information. See instructions on
[Docker Hub](https://hub.docker.com/r/dolthub/dolt-workbench) for connecting to local and
Docker installed databases.

### Saving connection information between runs

#### Using the file store

If you want to save connection metadata between Docker runs, you can mount a local
directory to the `store` directory in `/app/graphql-server` in the container.

```bash
% docker run -p 9002:9002 -p 3000:3000 -v ~/path/to/store:/app/graphql-server/store dolthub/dolt-workbench:latest
```

#### Using a MySQL database

You can also persist connection metadata in a MySQL-compatible database by providing
database connection information through environment variables.

Using a `.env` file:

```bash
# Specify individual fields:
DW_DB_DBNAME=dolt_workbench
DW_DB_PORT=3306
DW_DB_USER=<username>
DW_DB_PASS=<password>
DW_DB_HOST=host.docker.internal

# Or use a connection URI:
DW_DB_CONNECTION_URI=mysql://<username>:<password>@host.docker.internal:3306/dolt_workbench

# For databases that require secure connections
DW_DB_USE_SSL=true
```

```bash
% docker run -p 9002:9002 -p 3000:3000 --env-file <env_file_name> dolthub/dolt-workbench:latest
```

Or use the `-e` flag:

```bash
% docker run -p 9002:9002 -p 3000:3000 -e DW_DB_CONNECTION_URI="mysql://<username>:<password>@host.docker.internal:3306/dolt_workbench" dolthub/dolt-workbench:latest
```

Note that we do not create the database `dolt_workbench` for you. You must create it
yourself:

```sql
CREATE DATABASE dolt_workbench;
```

## Getting started from source

First, clone this repository.

### Run the GraphQL server

Start the GraphQL server. If successful, you'll see the GraphQL playground when you navigate to `localhost:9002/graphql`.

```
% cd graphql-server
graphql-server % yarn && yarn compile
graphql-server % yarn dev
```

### Run the web server

In another shell, start the web server. This will automatically point at the running
GraphQL server (localhost:9002).

```
% cd packages/web
web % yarn && yarn compile
web % yarn dev
```

Open your browser to [localhost:3002](http://localhost:3002).
