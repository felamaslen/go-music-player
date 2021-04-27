package read_test

import (
	"os"
	"path"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/read"
	setup "github.com/felamaslen/gmus-backend/pkg/testing"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

var _ = Describe("Scanning directories", func() {
	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("ScanDirectory", func() {
		var results []*types.File

		var testScanDirectory = func() {
			results = nil
			files := read.ScanDirectory(read.TestDirectory)

			done := false

			for !done {
				select {
				case result, more := <-files:
					if more {
						results = append(results, result)
					}
					done = !more
				}
			}
		}

		Context("when the database is empty", func() {
			BeforeEach(testScanDirectory)

			It("should return a channel with all the files in the directory", func() {
				Expect(results).To(HaveLen(2))

				if results[0].RelativePath == read.TestSong.RelativePath {
					Expect(results[0].RelativePath).To(Equal(read.TestSong.RelativePath))
					Expect(results[1].RelativePath).To(Equal(read.TestSongNested.RelativePath))
				} else {
					Expect(results[1].RelativePath).To(Equal(read.TestSong.RelativePath))
					Expect(results[0].RelativePath).To(Equal(read.TestSongNested.RelativePath))
				}
			})
		})

		Context("when the database already contains one of the files", func() {
			BeforeEach(func() {
				info, _ := os.Stat(path.Join(read.TestSong.BasePath, read.TestSong.RelativePath))

				db.MustExec(
					`
					insert into songs (title, artist, album, base_path, relative_path, modified_date)
					values ($1, $2, $3, $4, $5, $6)
					`,
					"old title",
					"old artist",
					"old album",
					read.TestSong.BasePath,
					read.TestSong.RelativePath,
					info.ModTime().Unix(),
				)

				testScanDirectory()
			})

			It("should only return those files which do not exist in the database", func() {
				Expect(results).To(HaveLen(1))
				Expect(results[0].RelativePath).To(Equal(read.TestSongNested.RelativePath))
			})
		})

		Context("when an error previously occurred scanning one of the files", func() {
			BeforeEach(func() {
				db.MustExec(`
				insert into scan_errors (base_path, relative_path, error)
				values ($1, $2, $3)
				`, read.TestSong.BasePath, read.TestSong.RelativePath, "A bad thing happened")

				testScanDirectory()
			})

			It("should only return those files which did not have errors marked against them", func() {
				Expect(results).To(HaveLen(1))
				Expect(results[0].RelativePath).To(Equal(read.TestSongNested.RelativePath))
			})
		})
	})

	Describe("UpsertSongsFromChannel", func() {
		var songs chan *types.Song

		var testScanSongs = func() {
			songs = make(chan *types.Song)

			go func() {
				defer close(songs)
				songs <- &types.Song{
					TrackNumber:  7,
					Title:        "Hey Jude",
					Artist:       "The Beatles",
					Album:        "",
					Duration:     431,
					BasePath:     "/path/to",
					RelativePath: "file.ogg",
					ModifiedDate: 8876,
				}

				songs <- &types.Song{
					TrackNumber:  11,
					Title:        "Starman",
					Artist:       "David Bowie",
					Album:        "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
					Duration:     256,
					BasePath:     "/different/path",
					RelativePath: "otherFile.ogg",
					ModifiedDate: 11883,
				}
			}()

			read.UpsertSongsFromChannel(songs)
		}

		Context("when the songs do not already exist in the database", func() {
			BeforeEach(testScanSongs)

			It("should insert the correct number of songs", func() {
				var count int
				db.Get(&count, "select count(*) from songs")
				Expect(count).To(Equal(2))
			})

			It("should insert both songs", func() {
				var songs []types.Song

				db.Select(&songs, `
	select track_number, title, artist, album, duration, base_path, relative_path, modified_date
	from songs
	order by title
	`)

				Expect(songs[0]).To(Equal(types.Song{
					TrackNumber:  7,
					Title:        "Hey Jude",
					Artist:       "The Beatles",
					Album:        "",
					Duration:     431,
					BasePath:     "/path/to",
					RelativePath: "file.ogg",
					ModifiedDate: 8876,
				}))

				Expect(songs[1]).To(Equal(types.Song{
					TrackNumber:  11,
					Title:        "Starman",
					Artist:       "David Bowie",
					Album:        "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
					Duration:     256,
					BasePath:     "/different/path",
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

				testScanSongs()
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
				var songs []types.Song
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

	Describe("ScanAndInsert", func() {
		It("should recursively scan files from a directory and add them to the database", func() {
			read.ScanAndInsert(read.TestDirectory)

			var songs []types.Song
			err := db.Select(&songs, `
	select title, artist, album, duration, base_path, relative_path
	from songs
      `)

			Expect(err).To(BeNil())

			Expect(songs).To(HaveLen(2))

			Expect(types.Song{
				Title:        read.TestSong.Title,
				Artist:       read.TestSong.Artist,
				Album:        read.TestSong.Album,
				Duration:     read.TestSong.Duration,
				BasePath:     read.TestSong.BasePath,
				RelativePath: read.TestSong.RelativePath,
			}).To(BeElementOf(songs))

			Expect(types.Song{
				Title:        read.TestSongNested.Title,
				Artist:       read.TestSongNested.Artist,
				Album:        read.TestSongNested.Album,
				Duration:     read.TestSongNested.Duration,
				BasePath:     read.TestSongNested.BasePath,
				RelativePath: read.TestSongNested.RelativePath,
			}).To(BeElementOf(songs))
		})
	})
})
