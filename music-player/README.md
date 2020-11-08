# music-scanner

This is the backend part of the music player, written in Golang.

## Building

Run `make build` inside this directory. Binaries will be built and output to the `bin` directory (which will be created if it does not exist).

## Testing

Run the following commands to run unit tests:

- `make test.read`: tests the file reader module

## Components

### Music scanner

This is intended to be run as a scheduled job. It will scan a directory and add relevant metadata to a PostgreSQL database.

**Usage**

`bin/scan`
