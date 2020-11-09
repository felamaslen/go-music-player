package db

import (
  "fmt"
  "context"

  "github.com/felamaslen/go-music-player/pkg/read"
)

func InsertMusicIntoDatabase(songs chan *read.Song) {
  conn := GetConnection()
  defer conn.Close(context.Background())

  for {
    select {
    case song, more := <- songs:
      if !more {
        return
      }

      var duration string = fmt.Sprintf("%d", song.Duration)
      if !song.DurationOk {
        duration = "NULL"
      }

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

      if err != nil {
        fmt.Printf("Error inserting record: %s\n", err)
      }
    }
  }
}
