# go-music-player (gmus)

## Backend

This manages the music library database, serves requests and handles client connections.

For more info, see the [readme](./gmus-backend/README.md).

## Frontend clients

Each frontend implements the APIs provided by the backend. Their job is to play music, or control the master client. The following clients are implemented:

- [gmus-web](./gmus-web/README.md) - web client
- [gmus-mobile](./gmus-mobile/README.md) - mobile app

## Architecture

### Database

This is PostgreSQL. It is responsible for storing the music files and their metadata.

### PubSub

This is implemented in Go using Redis. It is responsible for coordinating state between clients. Note that the only state which is stored on the backend is the list of clients currently connected.

### API

This is an HTTP API written in Go. It is responsible for implementing the PubSub, as well as serving data to the clients. The API may be running in multiple redundant containers.

### Scanner

This is a cronjob which periodically scans the library directory, keeping the database up to date.

### Watcher

This watches the library directory in real time, updating the database when it changes.

### Clients

Each client connects to the API. One client is "master", while all others are "slave". Master is responsible for playing the music, and keeping other clients up-to-date through the socket.

There is no authentication - all clients are trusted equally. Clients may take over master status whenever they want. Master must obey this instruction. Clients are responsible for providing unique names when connecting.
