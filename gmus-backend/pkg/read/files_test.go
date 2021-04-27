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

var _ = Describe("reading files", func() {

	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("reading file info", func() {
		var results []*types.Song
		var files chan *types.File

		BeforeEach(func() {
			results = nil
			files = make(chan *types.File, 1)
		})

		Context("when all the files are readable", func() {
			BeforeEach(func() {
				go func() {
					defer close(files)
					files <- &types.File{
						RelativePath: read.TestSong.RelativePath,
						ModifiedDate: 100123,
					}
				}()

				outputChan := read.ReadMultipleFiles(read.TestDirectory, files)

				outputDone := false

				for !outputDone {
					select {
					case result, more := <-outputChan:
						if more {
							results = append(results, result)
						}
						outputDone = !more
					}
				}
			})

			It("should return the correct number of results", func() {
				Expect(results).To(HaveLen(1))
			})

			It("should get the correct info from the file", func() {
				var expectedResult = read.TestSong
				expectedResult.ModifiedDate = 100123

				Expect(*results[0]).To(Equal(expectedResult))
			})
		})

		Context("when an error occurs reading a file", func() {
			BeforeEach(func() {
				go func() {
					defer close(files)
					files <- &types.File{
						RelativePath: "test/file/does/not/exist.ogg",
						ModifiedDate: 123,
					}
				}()

				outputChan := read.ReadMultipleFiles(read.TestDirectory, files)

				outputDone := false

				for !outputDone {
					select {
					case _, more := <-outputChan:
						outputDone = !more
					}
				}
			})

			It("should add the file to the scan_errors table", func() {
				var scanError []*types.ScanError
				db.Select(&scanError, "select relative_path, base_path, error from scan_errors")

				Expect(scanError).To(HaveLen(1))

				Expect(scanError[0]).To(Equal(&types.ScanError{
					RelativePath: "test/file/does/not/exist.ogg",
					BasePath:     read.TestDirectory,
					Error:        "open pkg/read/testdata/test/file/does/not/exist.ogg: no such file or directory",
				}))
			})
		})
	})

	Describe("scanning a directory recursively", func() {
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
})
