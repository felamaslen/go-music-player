package services_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/services"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
)

var _ = Describe("music scanner (integration test)", func() {

  BeforeEach(func() {
    setup.PrepareDatabaseForTesting()
  })

  It("should recursively scan files from a directory and add them to the database", func() {
    services.ScanAndInsert(read.TestDirectory)

    db := database.GetConnection()

    var songs []read.Song
    err := db.Select(&songs, `
      select title, artist, album, duration, base_path, relative_path
      from songs
    `)

    Expect(err).To(BeNil())

    Expect(songs).To(HaveLen(2))

    Expect(read.Song{
      Title: read.TestSong.Title,
      Artist: read.TestSong.Artist,
      Album: read.TestSong.Album,
      Duration: read.TestSong.Duration,
      BasePath: read.TestSong.BasePath,
      RelativePath: read.TestSong.RelativePath,
    }).To(BeElementOf(songs))

    Expect(read.Song{
      Title: read.TestSongNested.Title,
      Artist: read.TestSongNested.Artist,
      Album: read.TestSongNested.Album,
      Duration: read.TestSongNested.Duration,
      BasePath: read.TestSongNested.BasePath,
      RelativePath: read.TestSongNested.RelativePath,
    }).To(BeElementOf(songs))
  })
})
