package main

import (
	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/services"
)

func main() {
  services.ScanAndInsert(config.GetConfig().LibraryDirectory)

  database.EndPool()
}
