package main

import (
	"os"

	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/services"
)

const musicDirectory = read.TestDirectory

func main() {
  services.ScanAndInsert(musicDirectory)
  os.Exit(0)
}
