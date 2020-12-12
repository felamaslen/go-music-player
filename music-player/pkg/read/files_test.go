package read_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/go-music-player/pkg/read"
	_ "github.com/felamaslen/go-music-player/pkg/testing"
)

var _ = Describe("reading files", func() {

  Describe("reading file info", func() {
    var results []*read.Song

    BeforeEach(func() {
      results = nil
      files := make(chan string, 1)

      go func() {
	defer close(files)
	files <- read.TestSong.RelativePath
      }()

      outputChan := read.ReadMultipleFiles(read.TestDirectory, files)

      outputDone := false

      for !outputDone {
	select {
	case result, more := <- outputChan:
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
      Expect(*results[0]).To(Equal(read.TestSong))
    })
  })

  Describe("scanning a directory recursively", func() {
    var results []string

    BeforeEach(func() {
      results = nil
      files := read.ScanDirectory(read.TestDirectory)

      done := false

      for !done {
	select {
	case result, more := <- files:
	  if more {
	    results = append(results, result)
	  }
	  done = !more
	}
      }
    })

    It("should return a channel with all the files in the directory", func() {
      Expect(results).To(Equal([]string{
	read.TestSong.RelativePath,
	read.TestSongNested.RelativePath,
      }))
    })
  })
})
