package repository

import (
	"fmt"

	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/read"
)

func InsertMusicIntoDatabase(songs chan *read.Song) {
  var l = logger.CreateLogger(config.GetConfig().LogLevel)

  db := database.GetConnection()

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

      query, err := db.Query(
        `
        insert into songs (title, artist, album, duration, base_path, relative_path)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (base_path, relative_path) do update
        set
          title = excluded.title
          ,artist = excluded.artist
          ,album = excluded.album
          ,duration = excluded.duration
        `,
        song.Title,
        song.Artist,
        song.Album,
        duration,
        song.BasePath,
        song.RelativePath,
      )

      query.Close()

      if err == nil {
        l.Info("Added %s\n", song.RelativePath)
      } else {
        l.Error("Error inserting record: %s\n", err)
      }
    }
  }
}
