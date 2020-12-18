package duration_test

import (
	"os"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/read/duration"
	_ "github.com/felamaslen/gmus-backend/pkg/testing"
)

var _ = Describe("Reading ogg vorbis duration", func() {
	It("should get the correct duration in seconds", func() {
		file, _ := os.Open("pkg/read/testdata/file_example_OOG_1MG.ogg")

		result := duration.GetSongDurationSecondsVorbis(file)

		Expect(result).To(Equal(74))
	})
})
