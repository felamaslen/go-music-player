package server

import (
	"github.com/gorilla/websocket"
)

type Client struct {
  name string
  conn *websocket.Conn
  closeChan chan bool
}

type Member struct {
  Name string 		`json:"name"`
  LastPing int64 	`json:"lastPing"`
}

// Except for the client list, the application is stateless server-side.
// The source of truth for the current state of the player is that of the
// master client.
//
// If more than one client thinks that they are master, whichever sends
// an action across first should cause the other to obey the instruction
// and treat the first as master.
//
// The master client is responsible for:
// 1. Playing the music
// 2. Keeping the server updated regularly about the current state

type MusicPlayer struct {
  SongId int 		`json:"songId"`
  Playing bool 		`json:"playing"`
  PlayTimeSeconds int 	`json:"currentTime"`

  Master string 	`json:"master"`
}
