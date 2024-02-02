# Getting Started

So you want to run your very own bitcoin ordinals inscription launchpad?

## Prerequisites

nobody said bitcoin development was easy

- [localstack](https://docs.localstack.cloud/getting-started/)
- [bitcoind](https://github.com/bitcoin/bitcoin/releases)
- [rpcauth.py](https://github.com/bitcoin/bitcoin/blob/master/share/rpcauth/rpcauth.py)
- [nodejs](https://nodejs.org/en/download/current)
- [electrs](https://github.com/romanz/electrs)
- [mempool](https://github.com/mempool/mempool)
- [ord](https://github.com/ordinals/ord/releases)

## NodeJS Dependencies

```bash
npm i --g yarn
yarn
```

## Environment

Lots of environment variables to set.

### apps/www

```bash
mv apps/www/.env.example apps/www/.env.local
```

You will need an infura and alchemy key

### apps/graphql

```bash
mv apps/graphql/.env.example apps/graphql/.env
```

Run

```bash
node packages/backend/generateKeyPair.mjs
```

to fill in:

```
AUTH_MESSAGE_JWK=
AUTH_MESSAGE_PUBLIC_KEY=
```

doing a local deploy will fill in `TABLE_NAMES` and `INSCRIPTION_BUCKET`

## deploy

(with localstack running)

```bash
cd deploy
yarn
yarn deploy:local
```

## bootstrap

Assuming you have done everything above you should be able to start the dev backend

```bash
cd apps/graphql-backend
yarn start
```

Fix any errors that pop up.

Once the backend is running, bootstrap an admin user. By default, only the owner of the "ADMIN_ENS" for the EVM chain ID set as default can bootstrap. Probably there should be a local cookie set so that locally anyone can bootstrap.

(with the backend running)

```bash
cd apps/cli
yarn cli bootstrap --admin-address "0xbadbeef"
```

Now we can create a collection:
