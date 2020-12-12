package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/felamaslen/go-music-player/pkg/db"
	"github.com/felamaslen/go-music-player/pkg/read"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
)

func TestInsertMusicIntoDatabase(t *testing.T) {
  setup.PrepareDatabaseForTesting()

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

  conn := db.GetConnection()

  rows, err := conn.Query(
    context.Background(),
    `
    select title, artist, album, duration, base_path, relative_path
    from songs
    order by title
    `,
  )

  assert.Nil(t, err)

  var row read.Song

  rows.Next()
  rows.Scan(&row.Title, &row.Artist, &row.Album, &row.Duration, &row.BasePath, &row.RelativePath)

  assert.Equal(t, read.Song{
    Title: "Hey Jude",
    Artist: "The Beatles",
    Album: "",
    Duration: 431,
    BasePath: "/path/to",
    RelativePath: "file.ogg",
  }, row)

  rows.Next()
  rows.Scan(&row.Title, &row.Artist, &row.Album, &row.Duration, &row.BasePath, &row.RelativePath)

  assert.Equal(t, read.Song{
    Title: "Starman",
    Artist: "David Bowie",
    Album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
    Duration: 256,
    BasePath: "/different/path",
    RelativePath: "otherFile.ogg",
  }, row)
}
