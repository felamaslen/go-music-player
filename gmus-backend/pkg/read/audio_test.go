package read_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"os"
	"path"

	"github.com/felamaslen/gmus-backend/pkg/read"
	_ "github.com/felamaslen/gmus-backend/pkg/testing"
)

var _ = Describe("reading audio files", func() {

	rootDir, _ := os.Getwd()
	basePath := path.Join(rootDir, read.TestDirectory)

	Context("when the file is ogg vorbis", func() {
		It("should get the expected info from the file", func() {
			result, err := read.ReadFile(basePath, &read.File{
				RelativePath: read.TestSong.RelativePath,
				ModifiedDate: 102118,
			})

			Expect(err).To(BeNil())

			Expect(*result).To(Equal(read.Song{
				TrackNumber:  23,
				Title:        "Impact Moderato",
				Artist:       "Kevin MacLeod",
				Album:        "YouTube Audio Library",
				Duration:     74,
				BasePath:     basePath,
				RelativePath: "file_example_OOG_1MG.ogg",
				ModifiedDate: 102118,
			}))
		})
	})
})
