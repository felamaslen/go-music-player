package read

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	config "github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

func ReadMultipleFiles(basePath string, files chan *types.File) chan *types.Song {
	var db = database.GetConnection()
	var l = logger.CreateLogger(config.GetConfig().LogLevel)

	songs := make(chan *types.Song)

	go func() {
		defer func() {
			l.Verbose("[READ] Finished reading files")
			close(songs)
		}()

		for {
			select {
			case file, more := <-files:
				if more {
					l.Debug("[READ] %s\n", file.RelativePath)
					song, err := ReadFile(basePath, file)

					if err == nil {
						songs <- song
					} else {
						l.Error("[READ] Error (%s): %v\n", file.RelativePath, err)
						repository.InsertScanError(db, &types.ScanError{
							CreatedAt:    time.Now(),
							BasePath:     basePath,
							RelativePath: file.RelativePath,
							Error:        err.Error(),
						})
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

func GetFileInfo(file os.FileInfo, relativePath string) *types.File {
	if !isValidFile(file.Name()) {
		return nil
	}

	return &types.File{
		RelativePath: relativePath,
		ModifiedDate: file.ModTime().Unix(),
	}
}

// Utilities to aid directory reading
func recursiveDirScan(
	db *sqlx.DB,
	l *logger.Logger,
	allFiles *chan *types.File,
	rootDirectory string,
	relativePath string,
	isRoot bool,
) {
	directoryToScan := filepath.Join(rootDirectory, relativePath)

	if isRoot {
		l.Verbose("[SCAN] (root): %s\n", directoryToScan)

		defer func() {
			l.Verbose("[SCAN] Finished scanning directory")
			close(*allFiles)
		}()
	} else {
		l.Debug("[SCAN] %s\n", directoryToScan)
	}

	files, err := ioutil.ReadDir(directoryToScan)

	if err != nil {
		l.Error("[SCAN] Error (%s): %v", directoryToScan, err)
		return // TODO: add this to a table of failed directories
	}

	for _, file := range files {
		fileRelativePath := filepath.Join(relativePath, file.Name())

		if file.IsDir() {
			recursiveDirScan(
				db,
				l,
				allFiles,
				rootDirectory,
				fileRelativePath,
				false,
			)
		} else {
			validFile := GetFileInfo(file, fileRelativePath)
			if validFile != nil {
				*allFiles <- validFile
			}
		}
	}
}

func batchFilterFiles(
	db *sqlx.DB,
	l *logger.Logger,
	filteredOutput *chan *types.File,
	allFiles *chan *types.File,
	basePath string,
) {
	defer close(*filteredOutput)

	var batch [BATCH_SIZE]*types.File
	var batchSize = 0
	var numFiltered = 0

	var processBatch = func() {
		if batchSize == 0 {
			return
		}

		l.Debug("[FILTER] Processing batch\n")

		var relativePaths pq.StringArray
		var modifiedDates pq.Int64Array

		for i := 0; i < batchSize; i++ {
			relativePaths = append(relativePaths, batch[i].RelativePath)
			modifiedDates = append(modifiedDates, batch[i].ModifiedDate)
		}

		newOrUpdatedFiles, err := repository.SelectNewOrUpdatedFiles(db, relativePaths, modifiedDates, basePath)
		if err != nil {
			l.Fatal("[FILTER] Fatal error! %v\n", err)
		}

		for newOrUpdatedFiles.Next() {
			var file types.File
			newOrUpdatedFiles.StructScan(&file)

			l.Verbose("[NEW] %s\n", file.RelativePath)

			*filteredOutput <- &file
		}

		batchSize = 0
		newOrUpdatedFiles.Close()
	}

	for {
		select {
		case file, more := <-*allFiles:
			if !more {
				processBatch()
				l.Verbose("[FILTER] Finished filtering %d files\n", numFiltered)
				return
			}

			batch[batchSize] = file
			batchSize++

			numFiltered++
			if numFiltered%LOG_EVERY == 0 {
				l.Verbose("[FILTER] Processed %d\n", numFiltered)
			}

			if batchSize >= BATCH_SIZE {
				processBatch()
			}
		}
	}
}
