package server_test

const actionStateSetValid = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": true,
    "currentTime": 94,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client",
    "activeClients": []
  }
}
`

const actionStateSetIdNonPositive = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": 0,
    "playing": true,
    "currentTime": 94,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client",
    "activeClients": []
  }
}
`

const actionStateSetSongIdNull = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": null,
    "playing": false,
    "currentTime": 0,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client",
    "activeClients": []
  }
}
`

const actionStateSetCurrentTimeNegative = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": -32,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client",
    "activeClients": []
  }
}
`

const actionStateSetSeekTimeTooNegative = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": 13,
    "seekTime": -3,
    "queue": [],
    "master": "some-master-client",
    "activeClients": []
  }
}
`

const actionStateSetMasterEmpty = `
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": 13,
    "seekTime": -3,
    "queue": [],
    "master": "",
    "activeClients": []
  }
}
`

// CLIENT_LIST_UPDATED should only ever come from the server
const actionUnrecognised = `
{
  "type": "CLIENT_LIST_UPDATED",
  "payload": [
    { "name": "client-a", "lastPing": 123 },
    { "name": "client-b", "lastPing": 456 }
  ]
}
`
