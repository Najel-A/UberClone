# Setup

## Install dependencies
```text
npm install
```

## Hidden files
```text
touch .env (Add the following)
MONGO_URI= <MongoDB URI>
PORT= <Port>
SESSION_SECRET= <Your-Session-Secret>
JWT_SECRET= <Your-JWT-Secret>
FRONT_END_PORTS= 3000,3001,3002  # Comma-separated list of allowed frontend ports

```text
touch .env.docker (Add the following)
MONGO_URI= <MongoDB URI>
PORT= <Port>
SESSION_SECRET= <Your-Session-Secret>
JWT_SECRET= <Your-JWT-Secret>
FRONT_END_PORTS= 3000,3001,3002  # Comma-separated list of allowed frontend ports

```

### TODO
Complete the other services so they can become integrated with the admin service.