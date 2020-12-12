package services

import (
	"context"
	"testing"

	"github.com/felamaslen/go-music-player/pkg/db"
	"github.com/felamaslen/go-music-player/pkg/read"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
	"github.com/stretchr/testify/assert"
)

func TestIntegrationScanAndInsert(t *testing.T) {
  setup.PrepareDatabaseForTesting()

  ScanAndInsert(read.TestDirectory)

  conn := db.GetConnection()

  rows, err := conn.Query(
    context.Background(),
    `
    select
      title as "Title"
      ,artist as "Artist"
      ,album as "Album"
      ,coalesce(duration, 0) as "Duration"
      ,duration is not null as "DurationOk"
      ,base_path as "BasePath"
      ,relative_path as "RelativePath"
    from songs
    `,
  )

  assert.Nil(t, err)

  var song read.Song

  rows.Next()
  rows.Scan(&song.Title, &song.Artist, &song.Album, &song.Duration, &song.DurationOk, &song.BasePath, &song.RelativePath)

  assert.Equal(t, read.Song{
    Title: read.TestSong.Title,
    Artist: read.TestSong.Artist,
    Album: read.TestSong.Album,
    Duration: read.TestSong.Duration,
    DurationOk: true,
    BasePath: read.TestSong.BasePath,
    RelativePath: read.TestSong.RelativePath,
  }, song)
}
