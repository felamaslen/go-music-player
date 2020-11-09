package read

import (
  "os"
  "path/filepath"

  tag "github.com/dhowden/tag"

  duration "github.com/felamaslen/go-music-player/pkg/read/duration"
)

func ReadFile(basePath string, fileName string) (song *Song, err error) {
  fullPath := filepath.Join(basePath, fileName)
  file, errFile := os.Open(fullPath)
  if errFile != nil {
    return &Song{}, errFile
  }
  defer file.Close()

  tags, errTags := tag.ReadFrom(file)
  if errTags != nil {
    return &Song{}, errTags
  }

  durationTime, durationOk := duration.GetSongDuration(file, tags)

  result := Song{
    Title: tags.Title(),
    Artist: tags.Artist(),
    Album: tags.Album(),
    Duration: durationTime,
    DurationOk: durationOk,
    BasePath: basePath,
    RelativePath: fileName,
  }

  return &result, nil
}
