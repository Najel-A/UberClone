# Setup

## Setupp MySQL
```text
mysql -u root -p (Login to MySQL)
create database <DB_NAME>;
```

## Install dependencies
```text
npm install
```

## Hidden files
```text
touch .env (Add the following)
DB_NAME= <MySQL DB Name>
DB_USER= <MySQL DB User>
DB_PASSWORD= <MySQL DB Password>
DB_HOST= <MySQL DB Host>
DB_PORT= <MySQL DB Port>
KAFKA_BROKERS = <kafka ports>

```text
touch .env.docker (Add the following)
DB_NAME= <MySQL DB Name>
DB_USER= <MySQL DB User>
DB_PASSWORD= <MySQL DB Password>
DB_HOST= <MySQL DB Host> (IF YOU HAVE SQL ON LOCALHOST WINDOWS USE host.docker.internal || MAC USE localhost)
DB_PORT= <MySQL DB Port>
PORT=<port>

```