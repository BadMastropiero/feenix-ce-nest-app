## Description

Bootstrapped
with [Nest](https://github.com/nestjs/nest) , [TypeScript](https://www.typescriptlang.org/), [typeORM](https://typeorm.io/), [postgresql](https://www.postgresql.org/), [docker](https://www.docker.com/).

## Installation
 Create a `.env` file based on `.env.example` and fill in the values.

```bash
yarn install
```

## Docker

Booting DB:

```bash
docker compose up
```

To reset the database:

```bash
docker compose down -v
```

## Running the app

Development:

```bash
yarn run start
```

Watch mode:

```bash
yarn run start:dev
```

Production mode:

```bash
yarn run start:prod
```

## Test

unit tests:

```bash
yarn run test
```

e2e tests:

```bash
yarn run test:e2e
```

test coverage:

```bash
yarn run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
