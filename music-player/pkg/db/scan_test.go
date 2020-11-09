package db

import (
  "context"
  "testing"
  "github.com/stretchr/testify/assert"

  "github.com/felamaslen/go-music-player/pkg/read"
)

func TestInsertMusicIntoDatabase(t *testing.T) {
  conn := GetConnection()
  conn.Query(
    context.Background(),
    "truncate table songs",
  )
  defer conn.Close(context.Background())

  songs := make(chan *read.Song)

  go func() {
    defer close(songs)
    songs <- &read.Song{
      Title: "Hey Jude",
      Artist: "The Beatles",
      Album: "",
      Duration: 431,
      DurationOk: true,
      BasePath: "/path/to",
      RelativePath: "file.ogg",
    }
  }()

  InsertMusicIntoDatabase(songs)

  conn = GetConnection()

  type Row struct {
    id int
    title string
    artist string
    album string
    duration int
    base_path string
    relative_path string
  }

  var row Row

  err := conn.QueryRow(
    context.Background(),
    "select * from songs",
  ).Scan(&row.id, &row.title, &row.artist, &row.album, &row.duration, &row.base_path, &row.relative_path)

  assert.Nil(t, err)

  assert.Equal(t, row.title, "Hey Jude")
  assert.Equal(t, row.artist, "The Beatles")
  assert.Equal(t, row.album, "")
  assert.Equal(t, row.duration, 431)
  assert.Equal(t, row.base_path, "/path/to")
  assert.Equal(t, row.relative_path, "file.ogg")
}
