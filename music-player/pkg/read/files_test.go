package read

import (
  "os"
  "testing"
  "github.com/stretchr/testify/assert"
)

func TestReadMultipleFiles(t *testing.T) {
  directory, _ := os.Getwd()
  files := make(chan string, 1)

  go func() {
    files <- testFile
    close(files)
  }()

  outputChan := ReadMultipleFiles(directory, files)

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
    Title: testTitle,
    Artist: testArtist,
    Album: testAlbum,
    Duration: testLengthSeconds,
    DurationOk: true,
    BasePath: directory,
    RelativePath: testFile,
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
