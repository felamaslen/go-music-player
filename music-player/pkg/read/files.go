package read

import (
	"io/ioutil"
	"path/filepath"

	config "github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

const BATCH_SIZE = 100

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
  inputBatch *[BATCH_SIZE]*File,
  fileBatches *chan [BATCH_SIZE]*File,
  rootDirectory string,
  relativePath string,
  isRoot bool,
  batchIndex int,
) int {
  directoryToScan := filepath.Join(rootDirectory, relativePath)

  if (isRoot) {
    l.Verbose("Scanning root directory: %s\n", directoryToScan)

    defer func() {
      var remainingItemsExist = batchIndex > 0
      if remainingItemsExist {
        *fileBatches <- *inputBatch
      }

      l.Verbose("Finished recursive directory scan")
      close(*fileBatches)
    }()
  } else {
    l.Debug("Scanning subdirectory: %s\n", directoryToScan)
  }

  files, err := ioutil.ReadDir(directoryToScan)

  if err != nil {
    l.Error("Error scanning directory: (%s): %s", directoryToScan, err)
    return batchIndex
  }

  for _, file := range(files) {
    fileRelativePath := filepath.Join(relativePath, file.Name())

    if file.IsDir() {
      batchIndex = recursiveDirScan(
        db,
        l,
        inputBatch,
        fileBatches,
        rootDirectory,
        fileRelativePath,
        false,
        batchIndex,
      )
    } else if isValidFile(file.Name()) {

      if batchIndex == BATCH_SIZE {
        *fileBatches <- *inputBatch
        batchIndex = 0
      }

      (*inputBatch)[batchIndex] = &File{
        RelativePath: fileRelativePath,
        ModifiedDate: file.ModTime().Unix(),
      }

      batchIndex++
    }
  }

  return batchIndex
}

func maybeReadFile(
  db *sqlx.DB,
  l *logger.Logger,
  output *chan *File,
  inputBatch *chan [BATCH_SIZE]*File,
  basePath string,
) {
  defer close(*output)

  for {
    select {
    case batch, more := <- *inputBatch:
      if !more {
        return
      }

      var relativePaths pq.StringArray
      var modifiedDates pq.Int64Array

      for _, s := range batch {
        if s == nil {
          break
        }

        relativePaths = append(relativePaths, s.RelativePath)
        modifiedDates = append(modifiedDates, s.ModifiedDate)
      }

      newOrUpdatedFiles, err := db.Queryx(
        `
        select r.relative_path, r.modified_date
        from (
          select * from unnest($1::varchar[], $2::bigint[])
          as t(relative_path, modified_date)
        ) r

        left join songs on
          songs.base_path = $3
          and songs.relative_path = r.relative_path
          and songs.modified_date = r.modified_date

        where songs.id is null
        `,
        relativePaths,
        modifiedDates,
        basePath,
      )

      if err != nil {
        l.Fatal("Error determining file eligibility: %v\n", err)
      }

      for newOrUpdatedFiles.Next() {
        var file File
        newOrUpdatedFiles.StructScan(&file)

        l.Verbose("New or updated file: %s\n", file.RelativePath)

        *output <- &file
      }

      newOrUpdatedFiles.Close()
    }
  }
}

func ScanDirectory(directory string) chan *File {
  db := database.GetConnection()
  l := logger.CreateLogger(config.GetConfig().LogLevel)

  output := make(chan *File)
  fileBatches := make(chan [BATCH_SIZE]*File)

  go func() {
    maybeReadFile(db, l, &output, &fileBatches, directory)
  }()

  var inputBatch [BATCH_SIZE]*File
  
  go func() {
    recursiveDirScan(
      db,
      l,
      &inputBatch,
      &fileBatches,
      directory,
      "",
      true,
      0,
    )
  }()

  return output
}
