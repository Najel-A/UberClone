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

```text
touch .env.docker (Add the following)
MONGO_URI= <MongoDB URI>
PORT= <Port>
SESSION_SECRET= <Your-Session-Secret>
JWT_SECRET= <Your-JWT-Secret>

```

mkdir uploads
```

### TODO
Fix the images/media uploads