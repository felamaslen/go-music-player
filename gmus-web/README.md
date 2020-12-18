# gmus-web

This is a frontend web app for use with the [gmus backend](../gmus-backend/README.md).

## Scripts

### `yarn start`

Runs the app in the development mode.

### `yarn test`

Runs tests

### `yarn build`

Builds app

## Architecture

### Global app

This is the main part of the app. It is responsible for handling:

- Global state such as which song is playing, and the current time
- Connections to the API, through a websocket
- Sharing state with other clients, and responding to updates from the API
- Playing music, through an HTML <audio> element

### UI

This is the part of the app which implements user interaction. It is responsible for handling:

- User input, to decide which actions to take
- Display, to let the user know the state of things

UIs follow a common model and are built into separate bundles, then [lazily loaded](./src/components/ui/index.ts).

The following UIs are implemented:

#### cmus

This is based heavily on the cmus ncurses-based music player, and is essentially a web-based client with vim-like bindings for navigation.
