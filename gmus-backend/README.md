# gmus-backend

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

- `NAME=create_some_table make migrate.make`

## Components

### Music scanner

This is intended to be run as a scheduled job. It will scan a directory and add relevant metadata to a PostgreSQL database.

**Development usage**

`make run.scan`

### REST/WebSocket API

**Development usage**

`make run.server`

This is an HTTP server running the following endpoints:

## GET /stream?songid=<id>

Streams an audio file based on the `songid` value in the query string.

##  GET /pubsub

Handles long-running client connections, initiating a websocket.

## GET /artists

Fetches all artists, and outputs them in JSON format.

## GET /albums?artist=<artist>

Fetches albums for a particular artist, and outputs them in JSON format.

## GET /songs?artist=<artist>

Fetches songs for a particular artist, and outputs them in JSON format.

## GET /song-info?id=<id>

Fetches info for a particular song, based on its ID, and outputs it in JSON format.
