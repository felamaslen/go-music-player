package repository

import (
	"context"
	"fmt"

	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/db"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/read"
)

func InsertMusicIntoDatabase(songs chan *read.Song) {
  var l = logger.CreateLogger(config.GetConfig().LogLevel)

  for {
    select {
    case song, more := <- songs:
      if !more {
        l.Verbose("Finished inserting songs\n")
        return
      }

      l.Debug("Adding song: %v\n", song)

      duration := "NULL"
      if song.DurationOk {
        duration = fmt.Sprintf("%d", song.Duration)
      }

      conn := db.GetConnection()

      _, err := conn.Query(
        context.Background(),
        "insert into songs (title, artist, album, duration, base_path, relative_path) values ($1, $2, $3, $4, $5, $6)",
        song.Title,
        song.Artist,
        song.Album,
        duration,
        song.BasePath,
        song.RelativePath,
      )

      conn.Conn().Close(context.Background())

      if err != nil {
        l.Error("Error inserting record: %s\n", err)
      }
    }
  }
}
