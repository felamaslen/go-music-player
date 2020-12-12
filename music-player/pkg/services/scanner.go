package services

import (
	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/repository"
)

func ScanAndInsert(musicDirectory string) {
  var l = logger.CreateLogger(config.GetConfig().LogLevel)

  l.Info("Scanning directory for files...\n")
  files := read.ScanDirectory(musicDirectory)

  l.Info("Reading files...\n")
  songs := read.ReadMultipleFiles(musicDirectory, files)

  l.Info("Inserting data...\n")
  repository.InsertMusicIntoDatabase(songs)

  l.Info("Finished scan and insert\n")
}

