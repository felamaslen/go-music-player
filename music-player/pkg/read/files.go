package read

import (
	"io/ioutil"
	"path/filepath"

	config "github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/logger"
)

func ReadMultipleFiles(basePath string, files chan string) chan *Song {
  var l = logger.CreateLogger(config.GetConfig().LogLevel)

  songs := make(chan *Song)

  go func() {
    defer func() {
      l.Verbose("Finished reading files")
      close(songs)
    }()

    for {
      select {
      case file, more := <- files:
        if more {
          l.Verbose("Reading file: %s\n", file)
          song, err := ReadFile(basePath, file)

          if err == nil {
            songs <- song
          } else {
            l.Error("Error reading file (%s): %s\n", file, err)
          }
        } else {
          return
        }
      }
    }
  }()

  return songs
}

func isValidFile(file string) bool {
  // TODO: support FLAC/MP3
  return filepath.Ext(file) == ".ogg"
}

func recursiveDirScan(l *logger.Logger, directory string, output *chan string, root bool, basePath string) {
  if (root) {
    l.Verbose("Scanning root directory: %s\n", directory)

    defer func() {
      l.Verbose("Finished recursive directory scan")
      close(*output)
    }()
  } else {
    l.Debug("Scanning subdirectory: %s\n", directory)
  }


  files, err := ioutil.ReadDir(directory)

  if err != nil {
    l.Fatal("Error scanning directory: (%s): %s", directory, err)
    return
  }

  for _, file := range(files) {
    absolutePath := filepath.Join(directory, file.Name())
    relativePath := filepath.Join(basePath, file.Name())

    if file.IsDir() {
      recursiveDirScan(l, absolutePath, output, false, relativePath)
    } else if isValidFile(file.Name()) {
      l.Verbose("Found file: %s\n", relativePath)

      *output <- relativePath
    }
  }
}

func ScanDirectory(directory string) chan string {
  l := logger.CreateLogger(config.GetConfig().LogLevel)

  files := make(chan string)
  
  go func() {
    recursiveDirScan(l, directory, &files, true, "")
  }()

  return files
}
