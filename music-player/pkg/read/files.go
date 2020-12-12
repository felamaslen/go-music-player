package read

import (
	"io/ioutil"
	"path/filepath"

	config "github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/jmoiron/sqlx"
)

func ReadMultipleFiles(basePath string, files chan *File) chan *Song {
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
          l.Verbose("Reading file: %s\n", file.RelativePath)
          song, err := ReadFile(basePath, file)

          if err == nil {
            songs <- song
          } else {
            l.Error("Error reading file (%s): %s\n", file.RelativePath, err)
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

func recursiveDirScan(
  db *sqlx.DB,
  l *logger.Logger,
  output *chan *File,
  rootDirectory string,
  relativePath string,
  isRoot bool,
) {
  directoryToScan := filepath.Join(rootDirectory, relativePath)

  if (isRoot) {
    l.Verbose("Scanning root directory: %s\n", directoryToScan)

    defer func() {
      l.Verbose("Finished recursive directory scan")
      close(*output)
    }()
  } else {
    l.Debug("Scanning subdirectory: %s\n", directoryToScan)
  }

  files, err := ioutil.ReadDir(directoryToScan)

  if err != nil {
    l.Fatal("Error scanning directory: (%s): %s", directoryToScan, err)
    return
  }

  for _, file := range(files) {
    fileRelativePath := filepath.Join(relativePath, file.Name())

    if file.IsDir() {
      recursiveDirScan(
        db,
        l,
        output,
        rootDirectory,
        fileRelativePath,
        false,
      )
    } else if isValidFile(file.Name()) {
      modifiedDate := file.ModTime().Unix()

      var existingCount = 0

      err := db.Get(
        &existingCount,
        `
        select count(*) from songs
        where base_path = $1 and relative_path = $2 and modified_date = $3
        `,
        rootDirectory,
        fileRelativePath,
        modifiedDate,
      )

      if err == nil && existingCount == 0 {
        l.Verbose("Found file: %s\n", fileRelativePath)

        *output <- &File{
          RelativePath: fileRelativePath,
          ModifiedDate: modifiedDate,
        }
      }
    }
  }
}

func ScanDirectory(directory string) chan *File {
  db := database.GetConnection()
  l := logger.CreateLogger(config.GetConfig().LogLevel)

  files := make(chan *File)
  
  go func() {
    recursiveDirScan(
      db,
      l,
      &files,
      directory,
      "",
      true,
    )
  }()

  return files
}
