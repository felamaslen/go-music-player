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
const LOG_EVERY = 100

func ReadMultipleFiles(basePath string, files chan *File) chan *Song {
	var l = logger.CreateLogger(config.GetConfig().LogLevel)

	songs := make(chan *Song)

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
	allFiles *chan *File,
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
		} else if isValidFile(file.Name()) {
			*allFiles <- &File{
				RelativePath: fileRelativePath,
				ModifiedDate: file.ModTime().Unix(),
			}
		}
	}
}

func batchFilterFiles(
	db *sqlx.DB,
	l *logger.Logger,
	filteredOutput *chan *File,
	allFiles *chan *File,
	basePath string,
) {
	defer close(*filteredOutput)

	var batch [BATCH_SIZE]*File
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
			l.Fatal("[FILTER] Fatal error! %v\n", err)
		}

		for newOrUpdatedFiles.Next() {
			var file File
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

func ScanDirectory(directory string) chan *File {
	db := database.GetConnection()
	l := logger.CreateLogger(config.GetConfig().LogLevel)

	filteredOutput := make(chan *File)
	allFiles := make(chan *File)

	go func() {
		batchFilterFiles(db, l, &filteredOutput, &allFiles, directory)
	}()

	go func() {
		recursiveDirScan(
			db,
			l,
			&allFiles,
			directory,
			"",
			true,
		)
	}()

	return filteredOutput
}
