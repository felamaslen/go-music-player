package server

import (
	"github.com/gorilla/websocket"
)

type Client struct {
  name string
  conn *websocket.Conn
  closeChan chan bool
}

// This state lives on the server and is common to all clients.
// It describes the state of the music player, including who is currently
// responsible for playing the sound.
// Only one client is allowed to play the music at any one time (this could change later).
// Each client should have a fairly up-to-date (~2s) copy of this state, in order to
// accurately reflect the current state to the frontend.

type MusicPlayer struct {
  SongId int 		`json:"songId"`
  Playing bool 		`json:"playing"`
  PlayTimeSeconds int 	`json:"playTimeSeconds"`

  CurrentClient string 	`json:"currentClient"`
}
