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

	Describe("SelectSong", func() {
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
				TrackNumber:  7,
				Title:        "Hey Jude",
				Artist:       "The Beatles",
				Album:        "",
				Duration:     431,
				BasePath:     "/path/to",
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

	Describe("BatchUpsertSongs", func() {
		songs := [100]*read.Song{
			{
				TrackNumber:  1,
				Title:        "Title A",
				Artist:       "Artist A",
				Album:        "Album A",
				Duration:     123,
				BasePath:     "/base/path/1",
				RelativePath: "song1.ogg",
				ModifiedDate: 8886663103,
			},
			{
				TrackNumber:  2,
				Title:        "Title B",
				Artist:       "Artist B",
				Album:        "Album B",
				Duration:     456,
				BasePath:     "/base/path/2",
				RelativePath: "song2.ogg",
				ModifiedDate: 2711291992,
			},
		}

		Context("when the songs do not already exist", func() {
			BeforeEach(func() {
				repository.BatchUpsertSongs(db, &songs, 2)
			})

			It("should insert the batch into the database", func() {
				var result []*read.Song
				db.Select(&result, `
	select track_number, title, artist, album, duration, base_path, relative_path, modified_date
	from songs
	`)

				Expect(result).To(HaveLen(2))
				Expect(songs[0]).To(BeElementOf(result))
				Expect(songs[1]).To(BeElementOf(result))
			})
		})

		Context("when the songs already exist", func() {
			var result []*read.Song
			var modifiedBatch [100]*read.Song

			modifiedBatch[0] = songs[0]
			modifiedBatch[1] = songs[1]

			modifiedBatch[0].Title = "Title A modified"

			BeforeEach(func() {
				repository.BatchUpsertSongs(db, &songs, 2)

				repository.BatchUpsertSongs(db, &modifiedBatch, 2)

				db.Select(&result, `
	select track_number, title, artist, album, duration, base_path, relative_path, modified_date
	from songs
	`)
			})

			It("should not create any additional rows", func() {
				Expect(result).To(HaveLen(2))
			})

			It("should update the rows with any changes", func() {
				Expect(modifiedBatch[0]).To(BeElementOf(result))
			})
		})
	})
})
