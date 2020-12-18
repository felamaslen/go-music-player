package services

import (
	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/felamaslen/gmus-backend/pkg/repository"
)

const LOG_EVERY = 100

const BATCH_SIZE = 100

func UpsertSongsFromChannel(songs chan *read.Song) {
	var l = logger.CreateLogger(config.GetConfig().LogLevel)

	db := database.GetConnection()

	var batch [BATCH_SIZE]*read.Song
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
	files := read.ScanDirectory(musicDirectory)

	l.Info("Reading files...\n")
	songs := read.ReadMultipleFiles(musicDirectory, files)

	l.Info("Inserting data...\n")
	UpsertSongsFromChannel(songs)

	l.Info("Finished scan and insert\n")
}
