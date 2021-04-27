package read

// Scan library directory all at once

import (
	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

func ScanDirectory(directory string) chan *types.File {
	db := database.GetConnection()
	l := logger.CreateLogger(config.GetConfig().LogLevel)

	filteredOutput := make(chan *types.File)
	allFiles := make(chan *types.File)

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

func UpsertSongsFromChannel(songs chan *types.Song) {
	var l = logger.CreateLogger(config.GetConfig().LogLevel)

	db := database.GetConnection()

	var batch [BATCH_SIZE]*types.Song
	var batchSize = 0
	var numAdded = 0

	var processBatch = func() {
		if batchSize == 0 {
			return
		}

		l.Debug("[INSERT] Processing batch\n")
		if err := repository.BatchUpsertSongs(db, &batch, batchSize); err != nil {
			panic(err)
		}
		l.Debug("[INSERT] Processed batch\n")

		batchSize = 0
	}

	for {
		select {
		case song, more := <-songs:
			if !more {
				processBatch()
				l.Verbose("[INSERT] Finished inserting %d songs\n", numAdded)
				return
			}

			batch[batchSize] = song
			batchSize++

			numAdded++
			if numAdded%LOG_EVERY == 0 {
				l.Verbose("[INSERT] Inserted %d\n", numAdded)
			}

			if batchSize >= BATCH_SIZE {
				processBatch()
			}
		}
	}
}

func ScanAndInsert(musicDirectory string) {
	var l = logger.CreateLogger(config.GetConfig().LogLevel)

	l.Info("Scanning directory for files...\n")
	files := ScanDirectory(musicDirectory)

	l.Info("Reading files...\n")
	songs := ReadMultipleFiles(musicDirectory, files)

	l.Info("Inserting data...\n")
	UpsertSongsFromChannel(songs)

	l.Info("Finished scan and insert\n")
}
