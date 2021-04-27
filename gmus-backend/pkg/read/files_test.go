package read_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/read"
	setup "github.com/felamaslen/gmus-backend/pkg/testing"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

var _ = Describe("Reading files", func() {

	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("ReadMultipleFiles", func() {
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
})
