package read

import (
  "os"

  tag "github.com/dhowden/tag"

  duration "github.com/felamaslen/go-music-player/pkg/read/duration"
)

type Song struct {
  title, artist, album string
  length int
}

func getSongDuration(file *os.File, tags tag.Metadata) int {
  switch tags.Format() {
  case "VORBIS":
    result, _ := duration.GetSongDurationVorbis(file.Name())
    return result
  default:
    return 0
  }
}

func ReadFile(fileName string) (song *Song, err error) {
  file, errFile := os.Open(fileName)
  if errFile != nil {
    return &Song{}, errFile
  }
  defer file.Close()

  tags, errTags := tag.ReadFrom(file)
  if errTags != nil {
    return &Song{}, errTags
  }

  result := Song{
    title: tags.Title(),
    artist: tags.Artist(),
    album: tags.Album(),
    length: getSongDuration(file, tags),
  }

  return &result, nil
}
