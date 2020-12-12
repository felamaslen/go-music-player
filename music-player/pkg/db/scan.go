package db

import (
  "fmt"
  "context"

  "github.com/felamaslen/go-music-player/pkg/read"
)

func InsertMusicIntoDatabase(songs chan *read.Song) {
  for {
    select {
    case song, more := <- songs:
      if !more {
        return
      }

      duration := "NULL"
      if song.DurationOk {
        duration = fmt.Sprintf("%d", song.Duration)
      }

      conn := GetConnection()
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

      if err == nil {
        fmt.Printf("Inserted record successfully: %s, %s, %s, %s\n", song.RelativePath, song.Artist, song.Album, song.Title)
      } else {
        fmt.Printf("Error inserting record: %s\n", err)
      }
    }
  }
}