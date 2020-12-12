package main

import (
	"github.com/felamaslen/go-music-player/pkg/db"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/services"
)

const musicDirectory = read.TestDirectory

func main() {
  services.ScanAndInsert(musicDirectory)
  db.EndPool()
}
