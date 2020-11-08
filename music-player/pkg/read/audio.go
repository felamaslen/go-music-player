package read

import (
  "os"

  tag "github.com/dhowden/tag"

  duration "github.com/felamaslen/go-music-player/pkg/read/duration"
)

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
    length: duration.GetSongDuration(file, tags),
  }

  return &result, nil
}
