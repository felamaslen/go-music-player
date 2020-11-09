package read

import (
  "os"
  "testing"
  "github.com/stretchr/testify/assert"
)

func TestReadFile(t *testing.T) {
  basePath, _ := os.Getwd()

  result, err := ReadFile(basePath, testFile)

  assert.Nil(t, err)

  assert.Equal(t, result.Title, testTitle, "title must be correct")
  assert.Equal(t, result.Artist, testArtist, "artist must be correct")
  assert.Equal(t, result.Album, testAlbum, "album must be correct")
  assert.Equal(t, result.Duration, testLengthSeconds, "duration must be correct")
  assert.True(t, result.DurationOk, "duration must be fetched successfully")

  assert.Equal(t, result.BasePath, basePath)
  assert.Equal(t, result.RelativePath, testFile)
}
