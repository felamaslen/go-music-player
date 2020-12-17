package main

import (
	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/services"
)

func main() {
	var libraryDirectory = config.GetConfig().LibraryDirectory
	if len(libraryDirectory) == 0 {
		panic("Must set LIBRARY_DIRECTORY")
	}

	services.ScanAndInsert(libraryDirectory)

	database.EndPool()
}
