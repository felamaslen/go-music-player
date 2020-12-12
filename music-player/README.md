# music-scanner

This is the backend part of the music player, written in Golang.

## Building

Run `make build` inside this directory. Binaries will be built and output to the `bin` directory (which will be created if it does not exist).

## Testing

Run `make test` inside this directory, to run unit and integration tests.

## Migrations

First, make sure the following environment variables are set:

- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT` (**optional**, defaults to 5432)
- `POSTGRES_DATABASE`

Then, run:

- `make migrate`

### Creating migrations

After getting the [migrate CLI tool](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate), run:

- `migrate create -ext sql -dir pkg/db/migrations -seq create_some_table`

## Components

### Music scanner

This is intended to be run as a scheduled job. It will scan a directory and add relevant metadata to a PostgreSQL database.

**Usage**

`bin/scan`
