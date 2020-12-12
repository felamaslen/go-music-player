package read

import (
	"os"
	"path"
	"testing"

	_ "github.com/felamaslen/go-music-player/pkg/testing"
	"github.com/stretchr/testify/assert"
)

func TestReadFile(t *testing.T) {
  rootDir, _ := os.Getwd()
  basePath := path.Join(rootDir, TestDirectory)

  result, err := ReadFile(basePath, TestSong.RelativePath)

  assert.Nil(t, err)

  assert.Equal(t, Song{
    Title: "Impact Moderato",
    Artist: "Kevin MacLeod",
    Album: "YouTube Audio Library",
    Duration: 74,
    DurationOk: true,
    BasePath: basePath,
    RelativePath: "file_example_OOG_1MG.ogg",
  }, *result)
}
