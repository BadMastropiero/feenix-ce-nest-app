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
docker compose up db
```

Booting test DB:

```bash
docker compose up test-db
```

To reset the database:

```bash
docker compose down -v
```

## Running the app

Prepare the database:

```bash
yarn typeorm migration:run -d data-source.ts
```

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

Boot up the db test service:

```bash
docker compose up test-db
```

Unit tests:

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

## Dev Flow

Create new migration:

```bash
yarn typeorm migration:create src/migrations/<name>
```

## License

Nest is [MIT licensed](LICENSE).
