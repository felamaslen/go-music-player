package read

import (
	"testing"

	_ "github.com/felamaslen/go-music-player/pkg/testing"
	"github.com/stretchr/testify/assert"
)

func TestReadMultipleFiles(t *testing.T) {
  files := make(chan string, 1)

  go func() {
    files <- TestSong.RelativePath
    close(files)
  }()

  outputChan := ReadMultipleFiles(TestDirectory, files)

  var results []*Song

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

  assert.Len(t, results, 1)

  assert.Equal(t, TestSong, *results[0])
}

func TestScanDirectory(t *testing.T) {
  files := ScanDirectory(TestDirectory)

  var results []string

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

  assert.Equal(t, results, []string{TestSong.RelativePath, TestSongNested.RelativePath})
}
