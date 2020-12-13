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

    var testInsertSongs = func() {
      songs = make(chan *read.Song)

      go func() {
	defer close(songs)
	songs <- &read.Song{
	  TrackNumber: 7,
	  Title: "Hey Jude",
	  Artist: "The Beatles",
	  Album: "",
	  Duration: 431,
	  DurationOk: true,
	  BasePath: "/path/to",
	  RelativePath: "file.ogg",
	  ModifiedDate: 8876,
	}

	songs <- &read.Song{
	  TrackNumber: 11,
	  Title: "Starman",
	  Artist: "David Bowie",
	  Album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
	  Duration: 256,
	  DurationOk: true,
	  BasePath: "/different/path",
	  RelativePath: "otherFile.ogg",
	  ModifiedDate: 11883,
	}
      }()

      repository.InsertMusicIntoDatabase(songs)
    }

    Context("when the songs do not already exist in the database", func() {
      BeforeEach(testInsertSongs)

      It("should insert the correct number of songs", func() {
	var count int
	db.Get(&count, "select count(*) from songs")
	Expect(count).To(Equal(2))
      })

      It("should insert both songs", func() {
	var songs []read.Song

	db.Select(&songs, `
	select track_number, title, artist, album, duration, base_path, relative_path, modified_date
	from songs
	order by title
	`)

	Expect(songs[0]).To(Equal(read.Song{
	  TrackNumber: 7,
	  Title: "Hey Jude",
	  Artist: "The Beatles",
	  Album: "",
	  Duration: 431,
	  BasePath: "/path/to",
	  RelativePath: "file.ogg",
	  ModifiedDate: 8876,
	}))

	Expect(songs[1]).To(Equal(read.Song{
	  TrackNumber: 11,
	  Title: "Starman",
	  Artist: "David Bowie",
	  Album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
	  Duration: 256,
	  BasePath: "/different/path",
	  RelativePath: "otherFile.ogg",
	  ModifiedDate: 11883,
	}))
      })
    })

    Context("when there is already a file in the database with the same name", func() {
      BeforeEach(func() {
	db.MustExec(
	  `
	  insert into songs (title, artist, album, base_path, relative_path, modified_date)
	  values ($1, $2, $3, $4, $5, $6)
	  `,
	  "my title",
	  "my artist",
	  "my album",
	  "/path/to",
	  "file.ogg",
	  7782,
	)

	testInsertSongs()
      })

      It("should not add an additional row for the same file", func() {
	var count int
	db.Get(&count, `
	select count(*) from songs
	where base_path = '/path/to' and relative_path = 'file.ogg'
	`)

	Expect(count).To(Equal(1))
      })

      It("should upsert the existing item", func() {
	var songs []read.Song
	db.Select(&songs, `
	select
	  track_number
	  ,title
	  ,artist
	  ,album
	  ,duration
	  ,base_path
	  ,relative_path
	  ,modified_date
	from songs
	where base_path = '/path/to' and relative_path = 'file.ogg'
	`)

	Expect(songs).To(HaveLen(1))
	var song = songs[0]

	Expect(song.TrackNumber).To(Equal(7))
	Expect(song.Title).To(Equal("Hey Jude"))
	Expect(song.Artist).To(Equal("The Beatles"))
	Expect(song.Album).To(Equal(""))
	Expect(song.Duration).To(Equal(431))
	Expect(song.ModifiedDate).To(Equal(int64(8876)))
      })
    })
  })
})
