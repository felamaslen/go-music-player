package repository_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/repository"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
)

var _ = Describe("songs repository", func() {
  db := database.GetConnection()

  BeforeEach(func() {
    setup.PrepareDatabaseForTesting()
  })

  Context("when reading", func() {
    var id int64

    BeforeEach(func() {
      db.QueryRowx(
	`
	insert into songs (track_number, title, artist, album, duration, modified_date, base_path, relative_path)
	values ($1, $2, $3, $4, $5, $6, $7, $8)
	returning id
	`,
	7,
	"Hey Jude",
	"The Beatles",
	"",
	431,
	8876,
	"/path/to",
	"file.ogg",
      ).Scan(&id)
    })

    It("should retrieve a song from the database", func() {
      Expect(id).NotTo(BeZero())

      result, err := repository.SelectSong(db, int(id))

      Expect(err).To(BeNil())

      Expect(result).To(Equal(&read.Song{
	TrackNumber: 7,
	Title: "Hey Jude",
	Artist: "The Beatles",
	Album: "",
	Duration: 431,
	BasePath: "/path/to",
	RelativePath: "file.ogg",
	ModifiedDate: 8876,
      }))
    })

    Context("when the song does not exist", func() {
      It("should return an error", func() {
	result, err := repository.SelectSong(db, 88113)

	Expect(err).To(MatchError("No such ID"))
	Expect(result).To(BeNil())
      })
    })
  })
})
