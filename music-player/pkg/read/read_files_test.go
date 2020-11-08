package read

import (
  "testing"
  "github.com/stretchr/testify/assert"
)

const testFile = "testdata/file_example_OOG_1MG.ogg"

const testTitle = "Impact Moderato"
const testArtist = "Kevin MacLeod"
const testAlbum = "YouTube Audio Library"
const testLengthSeconds = 74

func TestReadFile(t *testing.T) {
  result, err := ReadFile(testFile)

  assert.Nil(t, err)

  assert.Equal(t, result.title, testTitle, "title must be correct")
  assert.Equal(t, result.artist, testArtist, "artist must be correct")
  assert.Equal(t, result.album, testAlbum, "album must be correct")
  assert.Equal(t, result.length, testLengthSeconds, "length must be correct")
}

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
