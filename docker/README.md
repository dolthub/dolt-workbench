# dolt-workbench

A modern, browser-based, open source SQL workbench for your MySQL and PostgreSQL compatible databases. Unlock powerful version control features when you use [Dolt](https://doltdb.com).

<img src="https://www.dolthub.com/blog/static/3f1358cd506d7b8ed383ea0751b67446/4f2ef/table-browser.png" width="850px" alt="Dolt Workbench" />

Features include:

- Modern, web-based table browser
- Auto-complete SQL queries
- Editing data using point and click interface
- ER diagrams
- File upload

For [Dolt](https://doltdb.com) databases, access additional version control features, such as:

- Commit log visualizations
- Branch navigation
- Tags
- Pull requests

You can find the code for the Dolt Workbench in [this GitHub repository](https://github.com/dolthub/dolt-workbench).

## Getting started

```zsh
% docker pull dolthub/dolt-workbench:latest
% docker run -p 9002:9002 -p 3000:3000 dolthub/dolt-workbench:latest
```

Go to http://localhost:3000 and add your connection information. See instructions below for connecting to locally and Docker installed databases.

You can also access the GraphQL Playground at http://localhost:9002/graphql.

### Saving connection information between runs

If you want to save connection information between Docker runs, you can mount a local
directory to the `store` directory in `/app/graphql-server` in the container.

```
% docker run -p 9002:9002 -p 3000:3000 -v ~/path/to/store:/app/graphql-server/store dolthub/dolt-workbench:latest
```

## Connecting to an internet accessible database

If your database is already internet accessible (i.e. your database is hosted on a service like [AWS RDS](https://aws.amazon.com/rds/) or [Hosted Dolt](https://hosted.doltdb.com)), simply enter your database connection information through the UI.

## Connecting to a locally installed database

If you'd like to connect to a database server running on your local machine, there are some additional steps to accept connections from other hosts. Docker containers cannot use `localhost` or `127.0.0.1` to access services running on the host machine because they have their own local network. Instead, you can use `host.docker.internal` as the host IP which Docker resolves to the internal IP address used by the host machine.

### MySQL

Set the `bind-address` directive in the MySQL configuration file (`my.cnf` or `my.ini`) to `0.0.0.0`. Restart the server.

```
bind-address    = 0.0.0.0
```

Use `host.docker.internal` as the host when entering your connection information from the UI.

On a Mac with MySQL installed via Homebrew, the location of this file is `/opt/homebrew/etc/my.cnf`. It can also be found at `/etc/mysql/my.cnf` or `/etc/mysql/mysql.conf.d/mysqld.cnf`.

### Dolt

Run the Dolt SQL server with host `0.0.0.0`.

```
my-dolt-db % dolt sql-server -H 0.0.0.0
```

Use `host.docker.internal` as the host when entering your connection information from the UI.

### PostgreSQL

Locate your PostgreSQL configuration file (`postgresql.conf`) and change the `listen_addresses` directive from `localhost` to `*`. Restart the server.

```
listen_addresses = '*'
```

Use `host.docker.internal` as the host when entering your connection information from the UI.

## Connecting to a Docker installed database

You can use Docker container networking to allow containers to connect to and communicate with each other, or to non-Docker workloads. This allows us to run a local server in the same network as the workbench.

First, create the network:

```
% docker network create dolt-workbench
```

And then run the workbench in that network:

```
% docker run --network dolt-workbench -p 9002:9002 -p 3000:3000 dolthub/dolt-workbench:latest
```

### MySQL

For MySQL databases, you can use the [`mysql/mysql-server`](https://hub.docker.com/r/mysql/mysql-server/) image to start a SQL server for a new database:

```
% docker run --network dolt-workbench --name mysql-db mysql/mysql-server:latest
```

Or an existing database on your local machine (see [MySQL documentation for more information](https://dev.mysql.com/doc/refman/8.0/en/docker-mysql-more-topics.html#docker-persisting-data-configuration)):

```
% docker run --name=mysql-db --network dolt-workbench \
--mount type=bind,src=/path-on-host-machine/my.cnf,dst=/etc/my.cnf \
--mount type=bind,src=/path-on-host-machine/datadir,dst=/var/lib/mysql \
-d mysql/mysql-server:latest
```

Some caveats to consider:

- You can see at the bottom of [this article](https://dev.mysql.com/doc/refman/8.0/en/macos-installation-pkg.html) where the relevant MySQL directories are located on a Mac. This location is different if you installed MySQL via Homebrew. If you get an error about the bind source path not existing, you may need to add these paths to the [shared paths configuration from Docker](https://docs.docker.com/desktop/settings/mac/#file-sharing).
- Your MySQL version must be the same for your Docker container and source data directory.
- For new servers, follow the instructions in the [`mysql/mysql-server` README](https://hub.docker.com/r/mysql/mysql-server/) for setting a password for the `root` user. You may want to create a new user for this workbench that can be accessed from any host.

When you enter your connection information from the UI, you can use `mysql-db` as the host name to connect to the database running in that container.

### Dolt

For Dolt databases, you can use the [`dolthub/dolt-sql-server`](https://hub.docker.com/repository/docker/dolthub/dolt-sql-server/general) image to start a SQL server for a new database:

```
% docker run --network dolt-workbench --name my-doltdb -p 3307:3306 dolthub/dolt-sql-server:latest
```

Or you can run a Dolt SQL server for an existing database on your local machine:

```
% docker run --network dolt-workbench -p 3307:3306 -v ~/path/to/parent/dir:/var/lib/dolt dolthub/dolt-sql-server:latest
```

When you enter your database configuration from the UI, you can use `my-doltdb` as the host name to connect to the database running in that container.

## Contact

You can reach us on [Discord](https://discord.com/invite/RFwfYpu) or [file a GitHub issue](https://github.com/dolthub/dolt-workbench/issues).
