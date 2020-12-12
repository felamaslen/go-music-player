package main

import (
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/services"
)

const musicDirectory = read.TestDirectory

func main() {
  services.ScanAndInsert(musicDirectory)

  database.EndPool()
}
