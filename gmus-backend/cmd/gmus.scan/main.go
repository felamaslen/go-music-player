package main

import (
	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/read"
)

func main() {
	var libraryDirectory = config.GetConfig().LibraryDirectory
	if len(libraryDirectory) == 0 {
		panic("Must set LIBRARY_DIRECTORY")
	}

	read.ScanAndInsert(libraryDirectory)

	database.EndPool()
}
