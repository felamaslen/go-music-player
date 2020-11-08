package read

import (
  "testing"
  "github.com/stretchr/testify/assert"
)

func TestReadMultipleFiles(t *testing.T) {
  files := make(chan string, 1)

  go func() {
    files <- testFile
    close(files)
  }()

  outputChan := ReadMultipleFiles(files)

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

  assert.Equal(t, *results[0], Song{
    title: testTitle,
    artist: testArtist,
    album: testAlbum,
    length: testLengthSeconds,
  })
}

func TestScanDirectory(t *testing.T) {
  files := ScanDirectory(".")

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

  assert.Equal(t, results, []string{testFile})
}
