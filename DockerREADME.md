# dolt-workbench

The Dolt Workbench can be connected to any MySQL-compatible database. Unlock extra version control features when you use [Dolt](https://doltdb.com).

You can find the code for the Dolt Workbench in [this GitHub repository](https://github.com/dolthub/dolt-workbench).

## Getting started

```zsh
% docker pull dolthub/dolt-workbench:latest
% docker run -p 9002:9002 -p 3000:3000 dolthub/dolt-workbench:latest
```

Go to http://localhost:3000 and add your database information.

You can also access the GraphQL Playground at http://localhost:9002/graphql.

### Using environment variables

If you'd like to specify your database information via environment variables rather than input through the UI, you can run the Docker image using a `DATABASE_URL` variable.

```zsh
% docker run -p 9002:9002 -p 3000:3000 -e DATABASE_URL=mysql://username:password@host/defaultdb dolthub/dolt-workbench:latest
```

You can disable SSL by setting `USE_SSL=false` and hide Dolt features (for non-Dolt MySQL databases) using `HIDE_DOLT_FEATURES=true`.

## Connecting to an internet accessible database

If your database is already internet accessible (i.e. your database is hosted on a service like [AWS RDS](https://aws.amazon.com/rds/) or [Hosted Dolt](https://hosted.doltdb.com)), simply enter your database connection information through the UI or pass the database URL environment variable to `docker run`.

## Connecting to a locally installed database

If you'd like to connect to a MySQL server running on your local machine, there are some additional steps. Docker containers cannot use `localhost` or `127.0.0.1` to access services running on the host machine because they have their own local network.

### MySQL

You'll can configure MySQL running on your local machine to accept connections.

By default, MySQL listens only to localhost. To allow connections from other hosts (like this Docker container), you can configure MySQL to listen to all IP addresses. This is done by setting the `bind-address` directive in the MySQL configuration file (`my.cnf` or `my.ini`) to `0.0.0.0`. Remember to restart the server after making this change (`brew services restart mysql`).

On a Mac with MySQL installed via Homebrew, the location of this file is `/opt/homebrew/etc/my.cnf`. It can also be found at `/etc/mysql/my.cnf` or `/etc/mysql/mysql.conf.d/mysqld.cnf`.

Docker containers cannot use `localhost` or `127.0.0.1` to access services running on the host machine because they have their own local network. Instead, you can use `host.docker.internal` as the host IP which Docker resolves to the internal IP address used by the host machine.

### Dolt

Once you have a running MySQL-compatible server, you need to open the port it is running on to the internet. To do this on a home or employer network, we recommend using [`ngrok`](https://ngrok.com/). `ngrok` is a hosted service that allows you to open a port on your computer to the internet fairly painlessly. First follow the [ngrok installation instructions](https://dashboard.ngrok.com/get-started/setup) for your operating system. Then run `ngrok tcp 3306` (or substitute 3306 for whichever port you started the server on). This will start a program with the following output in your terminal:

```zsh
ngrok by @inconshreveable                                       (Ctrl+C to quit)

Session Status                online
Account                       user@gmail.com (Plan: Free)
Version                       2.3.35
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    tcp://0.tcp.ngrok.io:15612 -> localhost:3306

Connections                   ttl     opn     rt1     rt5     p50     p90
                              78      0       0.00    0.01    0.05    0.40
```

Now a port on an `ngrok.io` host is open and forwarding traffic through a secure tunnel to a host on your machine. In the above case the `ngrok` host is named `0.tcp.ngrok.io` and the port is `15612`. You can use this to connect to your MySQL server from the Docker container.

## Connecting to a Docker installed database

You can use Docker container networking to allow containers to connect to and communicate with each other, or to non-Docker workloads. This allows us to run a local MySQL server in the same network as the workbench.

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

> Note: You can see at the bottom of [this article](https://dev.mysql.com/doc/refman/8.0/en/macos-installation-pkg.html) where the relevant MySQL directories are located on a Mac. This location is different if you installed MySQL via Homebrew. If you get an error about the bind source path not existing, you may need to add these paths to the [shared paths configuration from Docker](https://docs.docker.com/desktop/settings/mac/#file-sharing).

> Note: Your MySQL version must be the same for your Docker container and source data directory.

For new servers, follow the instructions in the [`mysql/mysql-server` README](https://hub.docker.com/r/mysql/mysql-server/) for setting a password for the `root` user. You may want to create a new user for this workbench that can be accessed from any host. When you enter your database configuration from the web UI, you can use `mysql-db` as the host name to connect to the database running in that container.

### Dolt

For Dolt databases, you can use the [`dolthub/dolt-sql-server`](https://hub.docker.com/repository/docker/dolthub/dolt-sql-server/general) image to start a SQL server for a new database:

```
% docker run --network dolt-workbench --name my-doltdb -p 3307:3306 dolthub/dolt-sql-server:latest
```

Or you can run a Dolt SQL server for an existing database on your local machine:

```
% docker run --network dolt-workbench --name my-doltdb -p 3307:3306 -v ~/path/to/parent/dir:/var/lib/dolt dolthub/dolt-sql-server:latest
```

When you enter your database configuration from the web UI, you can use `my-doltdb` as the host name to connect to the database running in that container.
