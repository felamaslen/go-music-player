package db

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/felamaslen/go-music-player/pkg/read"
)

func IntegrationTestInsertMusicIntoDatabase(t *testing.T) {
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

    songs <- &read.Song{
      Title: "Starman",
      Artist: "David Bowie",
      Album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
      Duration: 256,
      DurationOk: true,
      BasePath: "/different/path",
      RelativePath: "otherFile.ogg",
    }
  }()

  InsertMusicIntoDatabase(songs)

  conn := GetConnection()

  type Row struct {
    title string
    artist string
    album string
    duration int
    base_path string
    relative_path string
  }

  rows, err := conn.Query(
    context.Background(),
    `
    select title, artist, album, duration, base_path, relative_path
    from songs
    order by title
    `,
  )

  assert.Nil(t, err)

  var row Row

  rows.Next()
  rows.Scan(&row.title, &row.artist, &row.album, &row.duration, &row.base_path, &row.relative_path)

  assert.Equal(t, Row{
    title: "Hey Jude",
    artist: "The Beatles",
    album: "",
    duration: 431,
    base_path: "/path/to",
    relative_path: "file.ogg",
  }, row)

  rows.Next()
  rows.Scan(&row.title, &row.artist, &row.album, &row.duration, &row.base_path, &row.relative_path)

  assert.Equal(t, Row{
    title: "Starman",
    artist: "David Bowie",
    album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
    duration: 256,
    base_path: "/different/path",
    relative_path: "otherFile.ogg",
  }, row)
}
