package repository_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	setup "github.com/felamaslen/gmus-backend/pkg/testing"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

var _ = Describe("Songs repository", func() {
	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("SelectSong", func() {
		var id int64
		var id2 int64

		BeforeEach(func() {
			db.QueryRowx(
				testQueryInsertHeyJude,
				7,
				"Hey Jude",
				"The Beatles",
				"",
				431,
				8876,
				"/path/to",
				"file.ogg",
			).Scan(&id)

			db.QueryRowx(
				testQueryInsertTrack1,
				13,
				"Track 1",
				"Untitled Artist",
				"Some album",
				218,
				1993,
				"/path/different",
				"other.ogg",
			).Scan(&id2)
		})

		It("should retrieve a song from the database", func() {
			Expect(id).NotTo(BeZero())

			result, err := repository.SelectSong(db, []int{int(id)})

			Expect(err).To(BeNil())

			Expect(*result).To(HaveLen(1))
			Expect((*result)[0]).To(Equal(&types.Song{
				Id:           int(id),
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

		It("should retrieve multiple songs from the database", func() {
			Expect(id).NotTo(BeZero())
			Expect(id2).NotTo(BeZero())

			result, err := repository.SelectSong(db, []int{int(id), int(id2)})

			Expect(err).To(BeNil())

			Expect(*result).To(HaveLen(2))
			Expect((*result)[0]).To(Equal(&types.Song{
				Id:           int(id),
				TrackNumber:  7,
				Title:        "Hey Jude",
				Artist:       "The Beatles",
				Album:        "",
				Duration:     431,
				BasePath:     "/path/to",
				RelativePath: "file.ogg",
				ModifiedDate: 8876,
			}))

			Expect((*result)[1]).To(Equal(&types.Song{
				Id:           int(id2),
				TrackNumber:  13,
				Title:        "Track 1",
				Artist:       "Untitled Artist",
				Album:        "Some album",
				Duration:     218,
				BasePath:     "/path/different",
				RelativePath: "other.ogg",
				ModifiedDate: 1993,
			}))
		})

		Context("when the song does not exist", func() {
			It("should return an empty array", func() {
				result, err := repository.SelectSong(db, []int{88113})

				Expect(err).To(BeNil())
				Expect(*result).To(HaveLen(0))
			})
		})
	})

	Describe("BatchUpsertSongs", func() {
		songs := [100]*types.Song{
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
				var result []*types.Song
				db.Select(&result, testQuerySelectAllSongs)

				Expect(result).To(HaveLen(2))
				Expect(songs[0]).To(BeElementOf(result))
				Expect(songs[1]).To(BeElementOf(result))
			})
		})

		Context("when the songs already exist", func() {
			var result []*types.Song
			var modifiedBatch [100]*types.Song

			modifiedBatch[0] = songs[0]
			modifiedBatch[1] = songs[1]

			modifiedBatch[0].Title = "Title A modified"

			BeforeEach(func() {
				repository.BatchUpsertSongs(db, &songs, 2)
				repository.BatchUpsertSongs(db, &modifiedBatch, 2)

				result = []*types.Song{}
				db.Select(&result, testQuerySelectSong12)
			})

			It("should not create any additional rows", func() {
				Expect(result).To(HaveLen(2))
			})

			It("should update the rows with any changes", func() {
				Expect(modifiedBatch[0]).To(BeElementOf(result))
			})
		})
	})

	Describe("DeleteSongByPath", func() {
		BeforeEach(func() {
			_, err := db.Query(`
			insert into songs (title, artist, album, duration, base_path, relative_path, modified_date, track_number)
			values ('Title', 'Artist', 'Album', 123, '/base/path', 'path/to/file.ogg', 10123123, 1)
			`)
			if err != nil {
				panic(err)
			}
		})

		It("should delete a song from the database matching the given path", func() {
			var songs []*types.Song

			db.Select(&songs, "select * from songs where base_path = $1 and relative_path = $2", "/base/path", "path/to/file.ogg")
			Expect(songs).To(HaveLen(1))
			Expect(songs[0].Id).NotTo(BeZero())

			songs = []*types.Song{}

			repository.DeleteSongByPath(db, "/base/path", "path/to/file.ogg")

			db.Select(&songs, "select * from songs where base_path = $1 and relative_path = $2", "/base/path", "path/to/file.ogg")
			Expect(songs).To(HaveLen(0))
		})
	})
})
