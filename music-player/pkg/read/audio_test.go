package read

import (
  "testing"
  "github.com/stretchr/testify/assert"
)

func TestReadFile(t *testing.T) {
  result, err := ReadFile(testFile)

  assert.Nil(t, err)

  assert.Equal(t, result.title, testTitle, "title must be correct")
  assert.Equal(t, result.artist, testArtist, "artist must be correct")
  assert.Equal(t, result.album, testAlbum, "album must be correct")
  assert.Equal(t, result.length, testLengthSeconds, "length must be correct")
}
