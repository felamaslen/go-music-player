package repository_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/repository"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
)

var _ = Describe("scanning repository", func() {
  db := database.GetConnection()

  BeforeEach(func() {
    setup.PrepareDatabaseForTesting()
  })

  Describe("when the channel sends two files", func() {
    var songs chan *read.Song

    BeforeEach(func() {
      songs = make(chan *read.Song)

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

      repository.InsertMusicIntoDatabase(songs)
    })

    It("should insert the correct number of songs", func() {
      var count int
      db.Get(&count, "select count(*) from songs")
      Expect(count).To(Equal(2))
    })

    It("should insert both songs", func() {
      var song read.Song

      rows, _ := db.Queryx(`
      select title, artist, album, duration, base_path, relative_path
      from songs
      order by title
      `)

      rows.Next()
      rows.StructScan(&song)

      Expect(song).To(Equal(read.Song{
        Title: "Hey Jude",
        Artist: "The Beatles",
        Album: "",
        Duration: 431,
        BasePath: "/path/to",
        RelativePath: "file.ogg",
      }))

      rows.Next()
      rows.StructScan(&song)

      Expect(song).To(Equal(read.Song{
        Title: "Starman",
        Artist: "David Bowie",
        Album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
        Duration: 256,
        BasePath: "/different/path",
        RelativePath: "otherFile.ogg",
      }))

      rows.Close()
    })
  })
})
