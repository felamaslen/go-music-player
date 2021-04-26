package server

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	name      string
	conn      *websocket.Conn
	closeChan chan bool
	mu        sync.Mutex
}

type Member struct {
	Name     string `json:"name"`
	LastPing int64  `json:"lastPing"`
}

// Except for the client list, the application is stateless server-side.
// The source of truth for the current state of the player is that of the
// master client.
//
// If more than one client thinks that they are master, whichever sends
// an action across first should cause the other to obey the instruction
// and treat the first as master.
//
// The master client is responsible for keeping the server updated regularly about the current state.
//
// Active clients are all those clients which are responsible for playing the song.
// In contrast to master, there can be more than one active client.
// The master client is automatically active.
//
// This type here is merely used for validation of client state messages.
// Each client implementation MUST adhere to this spec.

type MusicPlayer struct {
	SongId        *int      `json:"songId" validate:"omitempty,gte=1"`
	Playing       bool      `json:"playing" validate:"-"`
	CurrentTime   float32   `json:"currentTime" validate:"gte=0"`
	SeekTime      float32   `json:"seekTime" validate:"min=-1"`
	Master        string    `json:"master" validate:"required"`
	ActiveClients *[]string `json:"activeClients" validate:"required"`
	Queue         *[]int    `json:"queue" validate:"required"`
}
