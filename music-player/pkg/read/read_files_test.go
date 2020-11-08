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
